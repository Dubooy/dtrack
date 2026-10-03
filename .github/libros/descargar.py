"""Descarga los clásicos de dominio público que Peak deja leer dentro de la app.

Busca cada libro de lista.json en Project Gutenberg (vía gutendex), baja el
EPUB y le quita los textos y la licencia de Project Gutenberg (la marca no se
puede usar en un producto comercial; el texto, al ser de dominio público, sí).
Deja beta/libros/<id>.epub y beta/libros/catalogo.json.
"""
import io, json, os, re, sys, time, unicodedata, urllib.parse, urllib.request, zipfile
from bs4 import BeautifulSoup

RAIZ = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SALIDA = os.path.join(RAIZ, "beta", "libros")
UA = {"User-Agent": "Peak-libros/1.0 (github.com/Dubooy/dtrack)"}


def baja(url, intentos=4):
    for i in range(intentos):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=60) as r:
                return r.read()
        except Exception as e:  # red inestable: reintenta
            if i == intentos - 1:
                raise
            print("  reintento", url, e)
            time.sleep(2 ** (i + 1))


def plano(s):
    s = unicodedata.normalize("NFKD", s or "").encode("ascii", "ignore").decode().lower()
    return re.sub(r"[^a-z0-9 ]+", " ", s)


def busca(item):
    if item.get("g"):
        d = json.loads(baja("https://gutendex.com/books/%d" % item["g"]))
        return d
    url = "https://gutendex.com/books/?languages=es&search=" + urllib.parse.quote(item["q"])
    res = json.loads(baja(url)).get("results", [])
    q, autor = plano(item["q"]), plano(item.get("autor", ""))
    for b in res:
        autores = " ".join(plano(a.get("name")) for a in b.get("authors", []))
        if "application/epub+zip" not in b.get("formats", {}):
            continue
        if q.split()[-1] not in plano(b.get("title")):
            continue
        if autor and not all(p in autores for p in autor.split()):
            continue
        return b
    return None


PG = re.compile(r"project\s+gutenberg|gutenberg\.org|gutenberg-tm|gutenberg ebook", re.I)


def limpia_html(datos):
    soup = BeautifulSoup(datos, "xml")
    quitado = 0
    for el in soup.find_all(id=re.compile(r"^pg-(header|footer|machine-header|start-separator|end-separator)")):
        el.decompose(); quitado += 1
    for el in soup.find_all(class_=re.compile(r"pg-boilerplate|pgheader|pgfooter")):
        el.decompose(); quitado += 1
    # enlaces del índice que apuntaban a la licencia
    for a in soup.find_all("a"):
        if PG.search(a.get_text(" ")) or re.search(r"#pg-(header|footer)", a.get("href", "")):
            li = a.find_parent("li") or a
            li.decompose(); quitado += 1
    for np in soup.find_all("navPoint"):
        txt = np.find("text")
        if txt and PG.search(txt.get_text(" ")):
            np.decompose(); quitado += 1
    # libros antiguos: la licencia va en <pre> o párrafos sueltos con las marcas *** START/END
    for el in soup.find_all("meta"):
        if PG.search(" ".join(str(v) for v in el.attrs.values())):
            el.decompose(); quitado += 1
    hojas = ["pre", "p", "div", "h1", "h2", "h3", "h4", "h5", "h6", "li", "td", "span", "blockquote"]
    for el in soup.find_all(hojas):
        if el.find(hojas):
            continue
        if PG.search(el.get_text(" ")):
            el.decompose(); quitado += 1
    return str(soup).encode("utf-8"), quitado


def limpia_opf(datos):
    soup = BeautifulSoup(datos, "xml")
    for tag in ("publisher", "source", "rights"):
        for el in soup.find_all(tag):
            el.decompose()
    for el in soup.find_all("meta"):
        if PG.search(el.get_text(" ") + " " + str(el.attrs)):
            el.decompose()
    for el in soup.find_all("identifier"):
        if PG.search(el.get_text(" ")):
            el.string = "urn:peak:libro"
    meta = soup.find("metadata")
    if meta is not None:
        r = soup.new_tag("dc:rights"); r.string = "Dominio público"; meta.append(r)
    return str(soup).encode("utf-8")


def es_licencia(datos):
    """Archivos que son solo la licencia de Gutenberg (su <title> lo dice)."""
    t = BeautifulSoup(datos, "xml").find("title")
    return bool(t and PG.search(t.get_text(" ")))


def quita_refs(datos, fuera, opf=False):
    soup = BeautifulSoup(datos, "xml")
    base = lambda h: (h or "").split("#")[0].rsplit("/", 1)[-1]
    if opf:
        ids = []
        for it in soup.find_all("item"):
            if base(it.get("href")) in fuera:
                ids.append(it.get("id")); it.decompose()
        for ir in soup.find_all("itemref"):
            if ir.get("idref") in ids:
                ir.decompose()
    else:
        for a in soup.find_all(["a", "content"]):
            if base(a.get("href") or a.get("src")) in fuera:
                (a.find_parent("navPoint") or a.find_parent("li") or a).decompose()
    return str(soup).encode("utf-8")


def limpia_epub(datos):
    zin = zipfile.ZipFile(io.BytesIO(datos))
    fuera = set()
    for info in zin.infolist():
        if info.filename.lower().endswith((".xhtml", ".html", ".htm")) and es_licencia(zin.read(info.filename)):
            fuera.add(info.filename.rsplit("/", 1)[-1])
    out = io.BytesIO()
    zout = zipfile.ZipFile(out, "w", zipfile.ZIP_DEFLATED)
    zout.writestr(zipfile.ZipInfo("mimetype"), "application/epub+zip", compress_type=zipfile.ZIP_STORED)
    quedan, quitado = [], len(fuera)
    for info in zin.infolist():
        if info.filename == "mimetype" or info.filename.rsplit("/", 1)[-1] in fuera:
            continue
        d = zin.read(info.filename)
        nombre = info.filename.lower()
        if nombre.endswith((".xhtml", ".html", ".htm", ".ncx")):
            if fuera:
                d = quita_refs(d, fuera)
            d, q = limpia_html(d); quitado += q
        elif nombre.endswith(".opf"):
            if fuera:
                d = quita_refs(d, fuera, opf=True)
            d = limpia_opf(d)
        if nombre.endswith((".xhtml", ".html", ".htm", ".ncx", ".opf")) and PG.search(d.decode("utf-8", "ignore")):
            quedan.append(info.filename)
        zi = zipfile.ZipInfo(info.filename, date_time=(2026, 1, 1, 0, 0, 0))
        zout.writestr(zi, d, compress_type=zipfile.ZIP_DEFLATED)
    zout.close()
    return out.getvalue(), quitado, quedan


def main():
    lista = json.load(open(os.path.join(os.path.dirname(__file__), "lista.json"), encoding="utf-8"))
    os.makedirs(SALIDA, exist_ok=True)
    cat, fallos = {}, []
    for item in lista:
        print("·", item["id"])
        try:
            b = busca(item)
            if not b:
                fallos.append(item["id"] + ": no está en Gutenberg"); continue
            gid = b["id"]
            datos = baja("https://www.gutenberg.org/ebooks/%d.epub.noimages" % gid)
            limpio, quitado, quedan = limpia_epub(datos)
            open(os.path.join(SALIDA, item["id"] + ".epub"), "wb").write(limpio)
            cat[item["id"]] = {
                "g": gid, "titulo": b.get("title"),
                "autor": "; ".join(a.get("name", "") for a in b.get("authors", [])),
                "kb": round(len(limpio) / 1024), "quitado": quitado, "quedan_pg": quedan,
            }
            print("  ok", gid, b.get("title"), "| quitado", quitado, "| quedan", quedan)
            time.sleep(1)
        except Exception as e:
            fallos.append("%s: %s" % (item["id"], e))
    json.dump({"libros": cat, "fallos": fallos}, open(os.path.join(SALIDA, "catalogo.json"), "w", encoding="utf-8"),
              ensure_ascii=False, indent=1)
    print("fallos:", fallos)


if __name__ == "__main__":
    sys.exit(main())

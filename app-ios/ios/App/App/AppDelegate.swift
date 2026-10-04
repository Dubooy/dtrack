import UIKit
import Capacitor

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {

    var window: UIWindow?

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        // Override point for customization after application launch.
        return true
    }

    func applicationWillResignActive(_ application: UIApplication) {
        // Sent when the application is about to move from active to inactive state. This can occur for certain types of temporary interruptions (such as an incoming phone call or SMS message) or when the user quits the application and it begins the transition to the background state.
        // Use this method to pause ongoing tasks, disable timers, and invalidate graphics rendering callbacks. Games should use this method to pause the game.
    }

    func applicationDidEnterBackground(_ application: UIApplication) {
        // Use this method to release shared resources, save user data, invalidate timers, and store enough application state information to restore your application to its current state in case it is terminated later.
        // If your application supports background execution, this method is called instead of applicationWillTerminate: when the user quits.
    }

    func applicationWillEnterForeground(_ application: UIApplication) {
        // Called as part of the transition from the background to the active state; here you can undo many of the changes made on entering the background.
    }

    func applicationDidBecomeActive(_ application: UIApplication) {
        // Restart any tasks that were paused (or not yet started) while the application was inactive. If the application was previously in the background, optionally refresh the user interface.
    }

    func applicationWillTerminate(_ application: UIApplication) {
        // Called when the application is about to terminate. Save data if appropriate. See also applicationDidEnterBackground:.
    }

    func application(_ app: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey: Any] = [:]) -> Bool {
        // Called when the app was launched with a url. Feel free to add additional processing here,
        // but if you want the App API to support tracking app url opens, make sure to keep this call
        return ApplicationDelegateProxy.shared.application(app, open: url, options: options)
    }

    func application(_ application: UIApplication, continue userActivity: NSUserActivity, restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void) -> Bool {
        // Called when the app was launched with an activity, including Universal Links.
        // Feel free to add additional processing here, but if you want the App API to support
        // tracking app url opens, make sure to keep this call
        return ApplicationDelegateProxy.shared.application(application, continue: userActivity, restorationHandler: restorationHandler)
    }

}

// MARK: - Peak.: la web publicada con la barra de abajo de Apple

import WebKit
import AuthenticationServices

/// Peak. dentro del iPhone: la web publicada (Capacitor) y, encima, la barra
/// de abajo nativa de Apple, que en iOS 26 sale con Liquid Glass.
/// La web cuenta por el canal «peakBarra» qué pestañas hay, cuál está abierta,
/// el color de la app y si hay algo a pantalla completa (entonces la barra se
/// esconde). Al tocar una pestaña se llama a peakNativo.ir(vista) en la web.
class PeakViewController: CAPBridgeViewController, UITabBarDelegate, WKScriptMessageHandler,
                          ASWebAuthenticationPresentationContextProviding {
    private let barra = UITabBar()
    private var pestanas: [[String]] = []
    private var oculta = true
    private var login: ASWebAuthenticationSession?

    private static let iconos: [String: (String, String)] = [
        "resumen": ("square.grid.2x2", "square.grid.2x2.fill"),
        "retos": ("trophy", "trophy.fill"),
        "vital": ("figure.run", "figure.run"),
        "academico": ("brain", "brain.fill"),
        "tareas": ("checklist", "checklist"),
        "social": ("person.2", "person.2.fill")
    ]

    // Capacitor cambia el userContentController de la configuración por el suyo
    // al crear la web, así que el canal se añade al suyo cuando ya existe.
    override func capacitorDidLoad() {
        super.capacitorDidLoad()
        guard let ucc = webView?.configuration.userContentController else { return }
        ucc.removeScriptMessageHandler(forName: "peakBarra")
        ucc.add(Debil(self), name: "peakBarra")
    }

    override func viewDidLoad() {
        super.viewDidLoad()
        barra.delegate = self
        barra.alpha = 0
        barra.isUserInteractionEnabled = false
        barra.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(barra)
        NSLayoutConstraint.activate([
            barra.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            barra.trailingAnchor.constraint(equalTo: view.trailingAnchor),
            barra.bottomAnchor.constraint(equalTo: view.bottomAnchor)
        ])
        ponPestanas([["resumen", "Hoy"], ["retos", "Objetivos"], ["vital", "Cuerpo"], ["academico", "Mente"], ["social", "Social"]])
    }

    private func ponPestanas(_ p: [[String]]) {
        pestanas = p
        barra.items = p.enumerated().map { (i, t) in
            let ico = Self.iconos[t[0]] ?? ("circle", "circle.fill")
            let item = UITabBarItem(title: t[1], image: UIImage(systemName: ico.0), selectedImage: UIImage(systemName: ico.1))
            item.tag = i
            return item
        }
    }

    private func muestra(_ si: Bool) {
        if oculta == !si { return }
        oculta = !si
        barra.isUserInteractionEnabled = si
        UIView.animate(withDuration: 0.22) { self.barra.alpha = si ? 1 : 0 }
    }

    // la web cuenta cómo está
    func userContentController(_ ucc: WKUserContentController, didReceive m: WKScriptMessage) {
        guard let d = m.body as? [String: Any] else { return }
        if let url = d["login"] as? String, let u = URL(string: url) { entrarConGoogle(u); return }
        if let p = d["pestanas"] as? [[String]], !p.isEmpty, p.allSatisfy({ $0.count == 2 }), p != pestanas { ponPestanas(p) }
        if let c = d["color"] as? String, let col = UIColor(peakHex: c) { barra.tintColor = col }
        if let v = d["vista"] as? String, let i = pestanas.firstIndex(where: { $0[0] == v }) { barra.selectedItem = barra.items?[i] }
        if let o = d["ocultar"] as? Bool { muestra(!o) }
    }

    // tocas una pestaña de la barra de Apple
    func tabBar(_ tabBar: UITabBar, didSelect item: UITabBarItem) {
        guard item.tag < pestanas.count else { return }
        let v = pestanas[item.tag][0].replacingOccurrences(of: "\"", with: "")
        UISelectionFeedbackGenerator().selectionChanged()
        webView?.evaluateJavaScript("window.peakNativo && window.peakNativo.ir(\"\(v)\")", completionHandler: nil)
    }

    // Google no deja entrar desde dentro de una app: se abre con iOS y vuelve por peak://login?code=…
    private func entrarConGoogle(_ url: URL) {
        let s = ASWebAuthenticationSession(url: url, callbackURLScheme: "peak") { [weak self] vuelta, _ in
            guard let self = self, let vuelta = vuelta,
                  let partes = URLComponents(url: vuelta, resolvingAgainstBaseURL: false),
                  let base = self.webView?.url, var destino = URLComponents(url: base, resolvingAgainstBaseURL: false) else { return }
            destino.queryItems = partes.queryItems
            destino.fragment = partes.fragment
            if let u = destino.url { DispatchQueue.main.async { self.webView?.load(URLRequest(url: u)) } }
        }
        s.presentationContextProvider = self
        s.prefersEphemeralWebBrowserSession = false
        login = s
        s.start()
    }

    func presentationAnchor(for session: ASWebAuthenticationSession) -> ASPresentationAnchor {
        view.window ?? ASPresentationAnchor()
    }
}

/// Para que WebKit no se quede con el controlador para siempre.
private class Debil: NSObject, WKScriptMessageHandler {
    weak var destino: WKScriptMessageHandler?
    init(_ d: WKScriptMessageHandler) { destino = d }
    func userContentController(_ ucc: WKUserContentController, didReceive m: WKScriptMessage) {
        destino?.userContentController(ucc, didReceive: m)
    }
}

extension UIColor {
    /// #rrggbb (o rgb(…) no: la web manda el valor de --accent, que va en hex)
    convenience init?(peakHex s: String) {
        var h = s.trimmingCharacters(in: .whitespaces)
        if h.hasPrefix("#") { h.removeFirst() }
        if h.count == 3 { h = h.map { "\($0)\($0)" }.joined() }
        guard h.count == 6, let n = UInt32(h, radix: 16) else { return nil }
        self.init(red: CGFloat((n >> 16) & 255) / 255, green: CGFloat((n >> 8) & 255) / 255, blue: CGFloat(n & 255) / 255, alpha: 1)
    }
}

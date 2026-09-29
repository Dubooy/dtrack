# Pone un esqueleto al modelo «human body base cartoon» de Fab y lo exporta a beta/cuerpo.glb.
# Uso: pip install bpy==4.5.14 ; python3 cuerpo-rig.py  (con body_base.blend del zip de Fab al lado)
# Los pesos de la piel los calcula Blender solo (pesos automáticos).
# La piel se reduce antes a 1024 px:  Image.open('Char_base_Base_color.png').convert('RGB').resize((1024,1024)).save('piel.jpg', quality=85)
import bpy
bpy.ops.wm.open_mainfile(filepath="body_base.blend")
o=bpy.data.objects["Body_OL"]
for m in list(o.modifiers): o.modifiers.remove(m)
# un solo material simple (el color lo pone la app)
# la piel original del modelo (la textura, reducida a 1024 px en JPEG)
mat=bpy.data.materials["Char_base"]
img=bpy.data.images.load(bpy.path.abspath("//piel.jpg")); img.name="piel"
for n in mat.node_tree.nodes:
    if n.type=="TEX_IMAGE": n.image=img
o.data.materials.clear(); o.data.materials.append(mat)
for p in o.data.polygons: p.material_index=0
o.name="cuerpo"
arm_data=bpy.data.armatures.new("esqueleto"); arm=bpy.data.objects.new("esqueleto", arm_data)
bpy.context.scene.collection.objects.link(arm)
bpy.context.view_layer.objects.active=arm; arm.select_set(True)
bpy.ops.object.mode_set(mode='EDIT')
eb=arm_data.edit_bones
def b(name, h, t, parent=None, conn=False):
    x=eb.new(name); x.head=h; x.tail=t
    if parent: x.parent=eb[parent]; x.use_connect=conn
    return x
b("cadera",(0,0.0,0.84),(0,0.0,0.95))
b("espalda1",(0,0.0,0.95),(0,0.01,1.08),"cadera",True)
b("espalda2",(0,0.01,1.08),(0,0.02,1.26),"espalda1",True)
b("cuello",(0,0.02,1.26),(0,0.01,1.335),"espalda2",True)
b("cabeza",(0,0.01,1.335),(0,0.0,1.5),"cuello",True)
for s,sx in (("L",1),("R",-1)):
    b("clav."+s,(sx*0.03,0.04,1.24),(sx*0.16,0.07,1.235),"espalda2")
    b("brazo."+s,(sx*0.16,0.07,1.235),(sx*0.44,0.075,1.21),"clav."+s,True)
    b("antebrazo."+s,(sx*0.44,0.075,1.21),(sx*0.69,0.04,1.19),"brazo."+s,True)
    b("mano."+s,(sx*0.69,0.04,1.19),(sx*0.83,0.0,1.185),"antebrazo."+s,True)
    b("muslo."+s,(sx*0.088,0.0,0.84),(sx*0.092,0.01,0.47),"cadera")
    b("pierna."+s,(sx*0.092,0.01,0.47),(sx*0.1,0.045,0.085),"muslo."+s,True)
    b("pie."+s,(sx*0.1,0.045,0.085),(sx*0.1,-0.1,0.02),"pierna."+s,True)
bpy.ops.object.mode_set(mode='OBJECT')
bpy.ops.object.select_all(action='DESELECT')
o.select_set(True); arm.select_set(True); bpy.context.view_layer.objects.active=arm
bpy.ops.object.parent_set(type='ARMATURE_AUTO')
print("vgroups", len(o.vertex_groups), [g.name for g in o.vertex_groups])
# vértices sin peso
sin=[v.index for v in o.data.vertices if not any(g.weight>0.01 for g in v.groups)]
print("sin peso", len(sin))
for im in list(bpy.data.images):
    if im.name!="piel": bpy.data.images.remove(im)
bpy.ops.export_scene.gltf(filepath="cuerpo.glb", export_format='GLB', export_skins=True, export_animations=False, export_materials='EXPORT', export_image_format='JPEG', export_normals=True, export_texcoords=True, export_yup=True)
bpy.ops.wm.save_as_mainfile(filepath="cuerpo_rig.blend")

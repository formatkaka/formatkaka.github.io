AFRAME.registerComponent('earth-texture', {
  init: function () {
    const material = new THREE.MeshPhongMaterial();
    material.map = new THREE.TextureLoader().load('../textures/earthmap.jpg');

    const mesh = this.el.getObject3D('mesh');
    mesh.material = material;

    const bumpTexture = new THREE.TextureLoader().load(
      '../textures/earthbump.jpg'
    );
    material.bumpMap = bumpTexture;
    material.bumpScale = 0.5;
  },
});

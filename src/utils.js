export function makePanel(scene, x, y, w, h, fill = 0x10182f, alpha = 0.85, stroke = 0x7489d6) {
  const g = scene.add.graphics();
  g.fillStyle(fill, alpha);
  g.lineStyle(2, stroke, 0.45);
  g.fillRoundedRect(x, y, w, h, 14);
  g.strokeRoundedRect(x, y, w, h, 14);
  return g;
}

export function fitText(textObj, width) {
  while (textObj.width > width && textObj.style.fontSize > 12) {
    textObj.setFontSize(textObj.style.fontSize - 1);
  }
}

export function gainAlignment(lucidDelta, nightfallDelta, state) {
  state.lucid = Phaser.Math.Clamp(state.lucid + lucidDelta, 0, 100);
  state.nightfall = Phaser.Math.Clamp(state.nightfall + nightfallDelta, 0, 100);
}

import QtQuick

// Paints a { w, h, data } sprite once at native resolution and scales it up
// without smoothing, so every art pixel stays a crisp block.
Item {
  id: root

  property var sprite: null
  property real px: 4
  property bool mirrored: false

  width: sprite ? sprite.w * px : 0
  height: sprite ? sprite.h * px : 0

  onSpriteChanged: canvas.requestPaint()

  Canvas {
    id: canvas
    width: root.sprite ? root.sprite.w : 1
    height: root.sprite ? root.sprite.h : 1
    smooth: false
    antialiasing: false
    transformOrigin: Item.TopLeft
    transform: [
      Scale { xScale: root.px * (root.mirrored ? -1 : 1); yScale: root.px },
      Translate { x: root.mirrored ? root.width : 0 }
    ]

    onAvailableChanged: if (available) requestPaint()
    onPaint: {
      var ctx = getContext("2d")
      ctx.clearRect(0, 0, width, height)
      var s = root.sprite
      if (!s) return
      // Horizontal runs of one color keep the fillRect count low.
      var d = s.data
      for (var y = 0; y < s.h; y++) {
        var x = 0
        while (x < s.w) {
          var i = (y * s.w + x) * 4
          var a = d[i + 3]
          if (!a) { x++; continue }
          var run = 1
          while (x + run < s.w) {
            var j = i + run * 4
            if (d[j] !== d[i] || d[j + 1] !== d[i + 1] || d[j + 2] !== d[i + 2] || d[j + 3] !== a) break
            run++
          }
          ctx.fillStyle = Qt.rgba(d[i] / 255, d[i + 1] / 255, d[i + 2] / 255, a / 255)
          ctx.fillRect(x, y, run, 1)
          x += run
        }
      }
    }
  }
}

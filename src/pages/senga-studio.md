---
title: Senga Studio
description: Senga Studio, in development at Mapleset LLC, is a standalone renderer that draws line art from 3D scenes.
hide_table_of_contents: true
---

# Senga Studio

**In development for macOS, Windows and Linux**

![The Senga Studio logo: the character 線 drawn as 3D blocks, beside the words Senga Studio, in yellow and blue](/img/products/senga-studio.png)

You have a 3D scene and want a line drawing of it. That was our starting point, too. Mapleset LLC is building Senga Studio, a standalone renderer that draws line art from 3D scenes. Senga (線画) means "line drawing" in Japanese. We modeled the logo above in 3D and drew it with Senga Studio.

![Black line drawing of a spacecraft with a long rectangular body, side panels and a round rear section](/img/products/senga-studio-spacecraft.png)

_A spacecraft model made in Blender and drawn by Senga Studio. Test render from the current development build._

The development build runs from the command line. It takes a glTF 2.0 scene and a settings file, and writes a PNG:

```
senga render scene.glb --lines scene.lines.json -o out.png
```

## Lines and brushes

What we're planning:

- **Line types:** outlines, object edges, intersections, creases, and edges where the material or smoothing changes.
- **Line sets:** each one picks its own objects or materials, with separate brushes for visible and hidden lines.
- **Brushes:** solid or dashed strokes, with control over size, stretch, angle and randomness.
- **Taper and fade:** strokes that thin or fade along a line or with distance.

## Release

Senga Studio isn't released yet, and there's no date. Before it ships, we'll add its privacy details to our [privacy policy](/privacy).

Questions about Senga Studio? Email [hello@mapleset.com](mailto:hello@mapleset.com).

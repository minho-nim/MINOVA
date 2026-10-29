# Deterministic resampling only. Never calls a generator or changes the source sheet.
param([string]$Source = 'public/assets/character-sheet-v3.png')
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
Add-Type -ReferencedAssemblies System.Drawing.Common,System.Drawing.Primitives,System.Private.Windows.GdiPlus,System.Private.Windows.Core -TypeDefinition @'
using System;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Drawing.Imaging;
public static class PortraitResample {
  public static void Save(Image source, int x, int y, int w, int h, string target) {
    using (var crop = new Bitmap(w, h)) {
      using (var g = Graphics.FromImage(crop)) {
        g.DrawImage(source, new Rectangle(0,0,w,h), x,y,w,h,GraphicsUnit.Pixel);
      }
      using(var result = new Bitmap(w*4,h*4)) {
        using(var g = Graphics.FromImage(result)) {
          g.InterpolationMode = InterpolationMode.HighQualityBicubic;
          g.PixelOffsetMode = PixelOffsetMode.HighQuality;
          using(var attrs = new ImageAttributes()) {
            attrs.SetWrapMode(WrapMode.TileFlipXY);
            g.DrawImage(crop,new Rectangle(0,0,result.Width,result.Height),0,0,w,h,GraphicsUnit.Pixel,attrs);
          }
        }
        // Mild luminance-only edge enhancement. No hue, lighting, face or costume edits.
        using(var sharp = (Bitmap)result.Clone()) {
          for(int j=1;j<result.Height-1;j++) for(int i=1;i<result.Width-1;i++) {
            var c=result.GetPixel(i,j);
            var n=result.GetPixel(i,j-1); var s=result.GetPixel(i,j+1);
            var e=result.GetPixel(i+1,j); var wv=result.GetPixel(i-1,j);
            double center=.2126*c.R+.7152*c.G+.0722*c.B;
            double avg=(.2126*(n.R+s.R+e.R+wv.R)+.7152*(n.G+s.G+e.G+wv.G)+.0722*(n.B+s.B+e.B+wv.B))/4;
            int delta=(int)Math.Round(Math.Clamp((center-avg)*.45,-5,5));
            sharp.SetPixel(i,j,Color.FromArgb(c.A,Math.Clamp(c.R+delta,0,255),Math.Clamp(c.G+delta,0,255),Math.Clamp(c.B+delta,0,255)));
          }
          sharp.Save(target,ImageFormat.Png);
        }
      }
    }
  }
}
'@
$portraitSpecs = @(
  @('oracle',@(13,102,245,310),@(@(22,708,72,96),@(103,708,72,96),@(184,708,70,96))),
  @('seoYoonha',@(273,102,238,310),@(@(277,708,72,96),@(355,708,72,96),@(434,708,72,96))),
  @('kangDohyun',@(524,102,237,310),@(@(530,708,70,96),@(606,708,70,96),@(683,708,70,96))),
  @('hanJiwoo',@(776,102,239,310),@(@(782,708,70,96),@(860,708,70,96),@(937,708,70,96))),
  @('baekSion',@(1030,102,237,310),@(@(1036,708,70,96),@(1114,708,70,96),@(1192,708,70,96))),
  @('ohHyejin',@(1283,102,240,310),@(@(1288,708,70,96),@(1367,708,70,96),@(1445,708,70,96)))
)
$portraitOutput = Join-Path (Get-Location) 'public/assets/portraits-v3-resampled'
New-Item -ItemType Directory -Path $portraitOutput -Force | Out-Null
$portraitSource = [Drawing.Image]::FromFile((Resolve-Path -LiteralPath $Source))
try {
  foreach($spec in $portraitSpecs) {
    $regions = ,$spec[1]
    $regions += $spec[2]
    for($i=1;$i -lt 4;$i++) {
      $r=$regions[$i]
      $suffix=if($i -eq 0){'portrait'}else{'expression-'+($i-1)}
      [PortraitResample]::Save($portraitSource,$r[0],$r[1],$r[2],$r[3],(Join-Path $portraitOutput ($spec[0]+'-'+$suffix+'.png')))
    }
  }
} finally { $portraitSource.Dispose() }
Write-Output 'Prepared 18 expression portraits from the unchanged source sheet (4x resampling, not recovered detail).'

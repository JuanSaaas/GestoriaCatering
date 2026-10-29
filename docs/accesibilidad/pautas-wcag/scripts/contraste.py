#!/usr/bin/env python3
"""Calcula la relación de contraste WCAG entre dos colores.

Uso:
  python contraste.py "#fondo" "#texto"
  python contraste.py "#ffffff" "#767676" --grande     # texto grande (>=24px o >=19px negrita)
  python contraste.py --paleta "#ffffff" "#767676" "#0b57d0" "#999999"
      (compara cada color de la lista contra el primero, que es el fondo)

Salida: relación, y si cumple AA/AAA para texto normal, texto grande y componentes de interfaz.
"""
import sys


def parse(c: str):
    c = c.strip().lstrip("#")
    if len(c) == 3:
        c = "".join(ch * 2 for ch in c)
    if len(c) != 6:
        raise ValueError(f"Color no válido: {c!r} (usa #RRGGBB)")
    return tuple(int(c[i:i + 2], 16) for i in (0, 2, 4))


def luminancia(rgb):
    def canal(v):
        v /= 255
        return v / 12.92 if v <= 0.03928 else ((v + 0.055) / 1.055) ** 2.4
    r, g, b = (canal(v) for v in rgb)
    return 0.2126 * r + 0.7152 * g + 0.0722 * b


def ratio(c1: str, c2: str) -> float:
    l1, l2 = luminancia(parse(c1)), luminancia(parse(c2))
    claro, oscuro = max(l1, l2), min(l1, l2)
    return (claro + 0.05) / (oscuro + 0.05)


def informe(fondo: str, texto: str, grande: bool = False) -> str:
    r = ratio(fondo, texto)
    ok = lambda v: "CUMPLE" if r >= v else "NO cumple"
    lineas = [
        f"{texto}  sobre  {fondo}  →  {r:.2f} : 1",
        f"  Texto normal  AA (4,5)  : {ok(4.5)}    AAA (7)   : {ok(7)}",
        f"  Texto grande  AA (3)    : {ok(3)}    AAA (4,5) : {ok(4.5)}",
        f"  Iconos, bordes, foco, gráficos AA (3) : {ok(3)}",
    ]
    if grande:
        lineas.append(f"  >>> Para TU caso (texto grande) AA: {ok(3)}")
    return "\n".join(lineas)


def main(argv):
    if len(argv) < 3 or argv[1] in ("-h", "--help"):
        print(__doc__)
        return 1
    try:
        if argv[1] == "--paleta":
            fondo, *resto = argv[2:]
            for c in resto:
                r = ratio(fondo, c)
                estado = "AA texto" if r >= 4.5 else ("solo texto grande/UI" if r >= 3 else "SUSPENDE")
                print(f"{c:>9} sobre {fondo}: {r:5.2f} : 1   {estado}")
            return 0
        fondo, texto = argv[1], argv[2]
        print(informe(fondo, texto, "--grande" in argv))
        return 0
    except ValueError as e:
        print(e)
        return 2


if __name__ == "__main__":
    sys.exit(main(sys.argv))

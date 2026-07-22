---
id: 68
level: 4
type: write
title: "Argumentos variables (*args)"
xp: 20
hint: "*args empaqueta todos los argumentos en una tupla. Usa sum() para sumarlos."
tests:
  - call: "sumar_varios(1, 2, 3)"
    expectedOutput: "6"
  - call: "sumar_varios(10, 20)"
    expectedOutput: "30"
---

Escribe la función "sumar_varios" que reciba una cantidad variable de números usando *args y devuelva la suma total.

```python
def sumar_varios(*args):
    # Escribe tu código aquí
```

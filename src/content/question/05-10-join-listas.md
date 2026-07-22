---
id: 75
level: 5
type: write
title: "Join de strings"
xp: 20
hint: '"separador".join(lista) une todos los elementos de la lista en un solo string usando el separador.'
tests:
  - call: 'unir(["Python", "es", "genial"], " ")'
    expectedOutput: "Python es genial"
  - call: 'unir(["a", "b", "c"], "-")'
    expectedOutput: "a-b-c"
---

Escribe la función "unir" que reciba una lista de strings y un separador, y devuelva todos los elementos unidos con ese separador usando join().

```python
def unir(lista, separador):
    # Escribe tu código aquí
```

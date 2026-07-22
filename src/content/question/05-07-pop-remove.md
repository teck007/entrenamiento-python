---
id: 72
level: 5
type: write
title: "pop y remove"
xp: 20
hint: "pop() saca por índice, remove() saca por valor."
tests:
  - call: "sacar([10, 20, 30, 40], 1, 30)"
    expectedOutput: "[10, 40]"
  - call: "sacar([\"a\", \"b\", \"c\", \"d\"], 0, \"c\")"
    expectedOutput: "[\"b\", \"d\"]"
---

Escribe la función "sacar" que reciba una lista, un índice y un valor. Debe eliminar el elemento en ese índice con pop(), luego eliminar el valor con remove(), y devolver la lista resultante.

```python
def sacar(lista, indice, valor):
    # Escribe tu código aquí
```

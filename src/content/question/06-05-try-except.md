---
id: 46
level: 6
type: fill
title: "Try-Except"
xp: 10
hint: "Pensá qué valor convertiría al denominador en cero, que es justo el error que el except está preparado para capturar."
tests:
  - expectedOutput: "Error: división por cero"
---

Completá el bloque try/except para manejar la división por cero.

```python
try:
    resultado = 10 / ___
    print(resultado)
except ZeroDivisionError:
    print("Error: división por cero")
```

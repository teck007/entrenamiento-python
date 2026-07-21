---
id: 64
level: 6
type: fill
title: "Finally"
xp: 10
hint: "El bloque finally se ejecuta SIEMPRE, haya o no error. Se usa para acciones de limpieza."
tests:
  - expectedOutput: "Error: división por cero\nBloque finally ejecutado"
---

Completa el bloque faltante.

```python
try:
    resultado = 10 / 0
    print(resultado)
except ZeroDivisionError:
    print("Error: división por cero")
___:
    print("Bloque finally ejecutado")
```

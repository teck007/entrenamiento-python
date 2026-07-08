---
id: 48
level: 5
type: predict
title: "Función con condicional"
xp: 20
hint: "El operador % devuelve el resto de la división. Si un número es divisible por 2, el resto es 0."
tests:
  - expectedOutput: "impar"
---

Analizá el siguiente programa y decidí qué imprime en la consola.

```python
def es_par(numero):
    if numero % 2 == 0:
        return "par"
    else:
        return "impar"

print(es_par(7))
```

---
id: 54
level: 5
type: predict
title: "any() y all()"
xp: 20
hint: "any() devuelve True si al menos un elemento del iterable cumple la condición."
tests:
  - expectedOutput: "True"
---

Analiza el siguiente programa y decide qué imprime.

```python
def es_positivo(x):
    return x > 0

numeros = [-2, 0, 5, -1, 3]
resultado = any(es_positivo(x) for x in numeros)
print(resultado)
```

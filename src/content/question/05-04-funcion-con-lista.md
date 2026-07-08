---
id: 44
level: 5
type: predict
title: "Función con lista"
xp: 20
hint: "La función recorre la lista y cuenta cuántos números son pares (divisibles por 2)."
tests:
  - expectedOutput: "3"
---

Analizá el siguiente programa y decidí qué imprime en la consola.

```python
def contar_pares(numeros):
    count = 0
    for n in numeros:
        if n % 2 == 0:
            count = count + 1
    return count

print(contar_pares([1, 2, 3, 4, 5, 6]))
```

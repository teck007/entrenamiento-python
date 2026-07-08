---
id: 23
level: 3
type: fill
title: Continue
xp: 10
hint: "Existe una palabra clave que salta a la siguiente iteración del bucle sin ejecutar el resto del bloque en esa vuelta."
tests:
  - expectedOutput: "1\n3\n5"
---

Completa para que muestre solo los números impares del 1 al 5.

```python
for i in range(1, 6):
    if i % 2 == 0:
        ___
    print(i)
```

---
id: 40
level: 5
type: predict
title: "Bucles anidados"
xp: 20
hint: "El bucle externo va de 1 a 3, el interno de 1 a 2. ¿Cuántas veces se ejecuta resultado = resultado + 1 en total?"
tests:
  - expectedOutput: "6"
---

Analizá el siguiente programa y decidí qué imprime en la consola.

```python
resultado = 0
for i in range(1, 4):
    for j in range(1, 3):
        resultado = resultado + 1
print(resultado)
```

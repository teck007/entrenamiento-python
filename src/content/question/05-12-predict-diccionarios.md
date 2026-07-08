---
id: 52
level: 5
type: predict
title: "Diccionarios"
xp: 20
hint: "El bucle itera sobre las claves del diccionario. Fijate qué valor se suma en cada iteración."
tests:
  - expectedOutput: "91"
---

Analizá el siguiente programa y decidí qué imprime.

```python
edades = {"Ana": 28, "Luis": 35, "Sofia": 28}
total = 0
for nombre in edades:
    total = total + edades[nombre]
print(total)
```

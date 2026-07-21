---
id: 52
level: 5
type: predict
title: "Diccionarios"
xp: 20
hint: "El bucle itera sobre las claves del diccionario. Fíjate qué valor se suma en cada iteración."
tests:
  - expectedOutput: "91"
---

Analiza el siguiente programa y decide qué imprime.

```python
edades = {"Ana": 28, "Luis": 35, "Sofia": 28}
total = 0
for nombre in edades:
    total = total + edades[nombre]
print(total)
```

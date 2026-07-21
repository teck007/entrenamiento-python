---
id: 55
level: 5
type: predict
title: "Recursión simple"
xp: 20
hint: "Una función recursiva se llama a sí misma. suma(5) = 5 + suma(4), suma(4) = 4 + suma(3)... hasta suma(1) = 1."
tests:
  - expectedOutput: "15"
---

Analiza el siguiente programa y decide qué imprime.

```python
def suma(n):
    if n == 1:
        return 1
    return n + suma(n - 1)

print(suma(5))
```

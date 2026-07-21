---
id: 53
level: 5
type: predict
title: "Comprensión de listas"
xp: 20
hint: "La comprensión genera una nueva lista transformando cada elemento. [x*2 for x in range(1,6)] produce [2,4,6,8,10]. Luego se suman todos."
tests:
  - expectedOutput: "20"
---

Analiza el siguiente programa y decide qué imprime.

```python
numeros = [x * 2 for x in range(1, 6)]
total = 0
for n in numeros:
    total = total + n
print(total)
```

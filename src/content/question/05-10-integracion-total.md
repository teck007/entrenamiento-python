---
id: 41
level: 5
type: predict
title: "Integración total"
xp: 20
hint: "La función recibe una lista, suma solo los números pares y devuelve el resultado. Identificá los pares en [1, 2, 3, 4, 5, 6]."
tests:
  - expectedOutput: "12"
---

Analizá el siguiente programa y decidí qué imprime en la consola.

```python
def procesar(lista):
    suma = 0
    for n in lista:
        if n % 2 == 0:
            suma = suma + n
    return suma

numeros = [1, 2, 3, 4, 5, 6]
print(procesar(numeros))
```

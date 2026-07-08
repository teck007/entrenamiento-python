---
id: 39
level: 4
type: fill
title: "Parámetros default"
xp: 10
hint: "Los parámetros con valor por defecto se usan cuando no se pasa un argumento. Fijate qué valor tiene 'saludo'."
tests:
  - expectedOutput: "Hola Ana"
---

Completá la llamada a la función para que muestre "Hola Ana" usando el valor por defecto de 'saludo'.

```python
def saludar(nombre, saludo="Hola"):
    print(f"{saludo} {nombre}")

saludar("___")
```

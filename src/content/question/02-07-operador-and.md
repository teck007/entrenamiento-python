---
id: 17
level: 2
type: fill
title: "Operador and"
xp: 10
hint: "Necesitás un operador lógico que combine dos condiciones y que solo dé verdadero si ambas lo son."
tests:
  - expectedOutput: "Acceso permitido"
---

Completa para que muestre "Acceso permitido" solo si usuario es "admin" y password es "1234".

```python
usuario = "admin"
password = "1234"
if usuario == "admin" ___ password == "1234":
    print("Acceso permitido")
else:
    print("Acceso denegado")
```

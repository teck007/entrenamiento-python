---
id: 47
level: 5
type: predict
title: "Listas y for"
xp: 20
hint: "Fijate cómo se va construyendo el string: cada nombre se agrega con un espacio. El método strip() saca espacios al inicio y final."
tests:
  - expectedOutput: "Ana Luis Sofia"
---

Analizá el siguiente programa y decidí qué imprime en la consola.

```python
nombres = ["Ana", "Luis", "Sofia"]
saludo = ""
for nombre in nombres:
    saludo = saludo + nombre + " "
print(saludo.strip())
```

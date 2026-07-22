---
id: 58
level: 8
type: fill
title: "Atributos de instancia"
xp: 10
hint: "Para que el método maullar pueda usar el nombre, tienes que guardarlo como atributo de la instancia usando self."
tests:
  - expectedOutput: "Bigotes dice Miau!"
---

Completa para que el método __init__ guarde el nombre correctamente.

```python
class Gato:
    def __init__(self, nombre):
        self.___ = nombre
    
    def maullar(self):
        print(f"{self.nombre} dice Miau!")

gato = Gato("Bigotes")
gato.maullar()
```

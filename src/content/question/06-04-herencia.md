---
id: 45
level: 6
type: write
title: Herencia
xp: 20
hint: "Definí un método con la misma firma que el de la clase padre para que Perro muestre su propio sonido."
tests:
  - call: "Perro().hacer_sonido()"
    expectedOutput: "Guau!"
---

Creá una clase "Animal" con método "hacer_sonido", y una clase "Perro" que herede de Animal y sobrescriba el método para mostrar "Guau!".

```python
class Animal:
    def hacer_sonido(self):
        print("...")

class Perro(Animal):
    # Escribe tu código aquí
```

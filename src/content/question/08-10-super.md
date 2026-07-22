---
id: 65
level: 8
type: write
title: "super()"
xp: 20
hint: "super() llama al método de la clase padre. En __init__ de la hija, primero llama a super().__init__() y luego agrega atributos propios."
tests:
  - call: 'Gato("Bigotes").sonido()'
    expectedOutput: "Bigotes hace Miau!"
---

Crea una clase `Animal` con `__init__` que reciba `nombre`, y una clase `Gato` que herede de `Animal`, llame a `super().__init__(nombre)`, y tenga un método `sonido()` que muestre "{nombre} hace Miau!".

```python
class Animal:
    def __init__(self, nombre):
        self.nombre = nombre

class Gato(Animal):
    # Escribe tu código aquí
```

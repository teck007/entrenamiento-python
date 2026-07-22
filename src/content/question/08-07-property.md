---
id: 62
level: 8
type: fill
title: "@property"
xp: 10
hint: "El decorador @property convierte un método en un atributo de solo lectura. Se accede sin paréntesis."
tests:
  - expectedOutput: "30"
---

Completa el decorador para que `r.area` funcione como un atributo.

```python
class Rectangulo:
    def __init__(self, ancho, alto):
        self.ancho = ancho
        self.alto = alto
    
    @___
    def area(self):
        return self.ancho * self.alto

r = Rectangulo(5, 6)
print(r.area)
```

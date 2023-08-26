""" 
First-order ODE integrators

An Ordinary Differential Equation is one where the function 
only contains one independent variable and its derivitives.
The order of the ODE is given by the highest order in the
derivitive.
"""


from typing import Callable, List
import math


def euler(dydt: Callable,
          y0: float,
          t_span: List,
          n_steps: int = None,
          step_size: float = None):
    """
    Solve an equation of the form: 

    y'(t) = f(t,y)
    y(t=0) = y0

    """
    if (n_steps is None) and (step_size is None):
        raise ValueError("n_steps or step_size must be specified")

    t_start, t_end = t_span
    if step_size is None:
        step_size = (t_end - t_start)/n_steps
    elif n_steps is None:
        n_steps = math.ceil((t_end - t_start)/step_size)

    t = t_start
    y = y0
    t_array = [t]
    y_array = [y]

    for i in range(n_steps):
        t_new = t+step_size
        y_new = y + step_size*dydt(y)
        t_array.append(t_new)
        y_array.append(y_new)
        t = t_new
        y = y_new

    return (t_array, y_array)


def dfdt(t):
    return t


f0 = 1

print(euler(dfdt, f0, t_span=[0, 5], step_size=1))

""" 
First-order ODE integrators

An Ordinary Differential Equation is one where the function 
only contains one independent variable and its derivitives.
The order of the ODE is given by the highest order in the
derivitive.
"""


from typing import Callable, List
import numpy as np


def euler(dydt: Callable,
          y0: List[float],
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
        n_steps = np.ceil((t_end - t_start)/step_size)

    t = t_start
    y = y0
    t_array = np.array(t)
    y_array = np.array(y)

    for _ in np.arange(n_steps):
        t_new = t+step_size
        y_new = y + step_size * np.array(dydt(t, y))
        t_array = np.append(t_array, t_new)
        y_array = np.vstack([y_array, y_new])
        t = t_new
        y = y_new

    return (t_array, y_array)

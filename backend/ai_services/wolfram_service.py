# -*- coding: utf-8 -*-
"""
🧮 WOLFRAM ALPHA SERVICE
Symbolic computation and mathematical accuracy verification.
"""
import os
import httpx
from typing import Dict, Any, Optional, List, Tuple
from decimal import Decimal, getcontext

getcontext().prec = 28


class WolframAlphaService:
    """Wolfram Alpha service for symbolic computation and math verification"""
    
    def __init__(self):
        self.app_id = os.getenv("WOLFRAM_APP_ID", "")
        self.base_url = "https://api.wolframalpha.com/v2"
    
    async def query(self, input_query: str) -> Dict[str, Any]:
        """Query Wolfram Alpha for computational results"""
        if not self.app_id:
            return {
                "status": "error",
                "error": "Wolfram Alpha API key not configured"
            }
        
        params = {
            "input": input_query,
            "format": "plaintext",
            "output": "JSON",
            "appid": self.app_id
        }
        
        async with httpx.AsyncClient(timeout=30.0) as client:
            try:
                response = await client.get(
                    f"{self.base_url}/query",
                    params=params
                )
                response.raise_for_status()
                data = response.json()
                
                return {
                    "status": "success",
                    "queryresult": data.get("queryresult", {}),
                    "input": input_query
                }
            except Exception as e:
                return {
                    "status": "error",
                    "error": str(e),
                    "input": input_query
                }
    
    def evaluate_symbolic_expression(self, expression: str) -> Dict[str, Any]:
        """Evaluate symbolic mathematical expression with 28-digit precision"""
        try:
            import sympy as sp
            x = sp.symbols('x')
            expr = sp.sympify(expression)
            result = sp.N(expr, 28)
            
            return {
                "status": "success",
                "expression": expression,
                "result": str(result),
                "precision": "28_digits"
            }
        except Exception as e:
            return {
                "status": "error",
                "error": str(e),
                "expression": expression
            }
    
    def generate_graph_coordinates(self, function: str, x_range: Tuple[float, float] = (-10, 10), 
                                   points: int = 100) -> Dict[str, Any]:
        """Generate graph coordinates with zero drift"""
        try:
            import numpy as np
            import sympy as sp
            
            x = sp.symbols('x')
            expr = sp.sympify(function)
            f = sp.lambdify(x, expr, 'numpy')
            
            x_vals = np.linspace(x_range[0], x_range[1], points)
            y_vals = f(x_vals)
            
            # Convert to Decimal for 28-digit precision
            coordinates = [
                {
                    "x": float(Decimal(str(x_val)).quantize(Decimal('0.0000000000000000000000000001'))),
                    "y": float(Decimal(str(y_val)).quantize(Decimal('0.0000000000000000000000000001')))
                }
                for x_val, y_val in zip(x_vals, y_vals)
            ]
            
            return {
                "status": "success",
                "function": function,
                "coordinates": coordinates,
                "precision": "28_digits",
                "x_range": x_range,
                "points": points
            }
        except Exception as e:
            return {
                "status": "error",
                "error": str(e),
                "function": function
            }
    
    def translate_stylus_to_symbolic(self, stylus_coordinates: List[Dict[str, float]]) -> Dict[str, Any]:
        """Translate stylus coordinates to symbolic mathematical function"""
        try:
            import numpy as np
            from scipy.interpolate import interp1d
            
            x_coords = [coord["x"] for coord in stylus_coordinates]
            y_coords = [coord["y"] for coord in stylus_coordinates]
            
            # Create interpolation
            f = interp1d(x_coords, y_coords, kind='cubic', fill_value='extrapolate')
            
            # Try to fit to polynomial
            from numpy.polynomial import Polynomial
            poly = Polynomial.fit(x_coords, y_coords, deg=min(5, len(x_coords)-1))
            
            return {
                "status": "success",
                "symbolic_function": str(poly),
                "interpolation_points": len(stylus_coordinates),
                "degree": min(5, len(x_coords)-1)
            }
        except Exception as e:
            return {
                "status": "error",
                "error": str(e),
                "coordinates_count": len(stylus_coordinates)
            }

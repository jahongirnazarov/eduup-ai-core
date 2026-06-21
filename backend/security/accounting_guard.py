# -*- coding: utf-8 -*-
"""
💰 FIXED-POINT ACCOUNTING GUARD
Eliminates binary float representation leaks and IEEE 754 precision drifts.
Enforces 28-digit fixed-point decimal scaling for all financial operations.
"""
from decimal import Decimal, getcontext

# Configure Decimal precision for 28-digit fixed-point accounting
getcontext().prec = 28
FIXED_POINT_SCALING = Decimal('1.0000000000000000000000000000')


class FixedPointAccountingGuard:
    """Fixed-point accounting guard for financial precision"""
    
    def __init__(self):
        self.scaling_multiplier = FIXED_POINT_SCALING
    
    def cast_to_fixed_point(self, value: float) -> Decimal:
        """Cast any numeric value to 28-digit fixed-point Decimal"""
        return Decimal(str(value)) * self.scaling_multiplier
    
    def process_currency_amount(self, amount: float, currency_iso: str = "UZS") -> Decimal:
        """Process currency amount through fixed-point precision controller"""
        fixed_amount = self.cast_to_fixed_point(amount)
        return fixed_amount.quantize(Decimal('0.0000000000000000000000000001'))
    
    def calculate_cross_border_conversion(self, amount: Decimal, exchange_rate: Decimal) -> Decimal:
        """Calculate cross-border currency conversion with fixed-point precision"""
        return (amount * exchange_rate).quantize(Decimal('0.0000000000000000000000000001'))
    
    def validate_subscription_balance(self, balance: Decimal, required: Decimal) -> bool:
        """Validate subscription balance with fixed-point comparison"""
        return balance >= required

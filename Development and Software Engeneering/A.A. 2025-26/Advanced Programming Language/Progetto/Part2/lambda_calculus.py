#!/usr/bin/env python3
"""
Lambda Calculus Interpreter

Supports:
- Lambda abstractions: λx.body or \\x.body
- Application: (f x) or f x
- Variables: x, y, z, etc.
- Three reduction strategies: normal, value, full
- Church encodings for numbers and booleans
- Interactive step-by-step debugger with redex highlighting
"""

from dataclasses import dataclass
from typing import Set
from enum import Enum
import re


# =============================================================================
# AST Definitions
# =============================================================================

@dataclass
class Var:
    """A variable."""
    name: str
    
    def __str__(self):
        return self.name
    
    def __eq__(self, other):
        return isinstance(other, Var) and self.name == other.name
    
    def __hash__(self):
        return hash(('Var', self.name))


@dataclass
class Lam:
    """A lambda abstraction: λparam.body"""
    param: str
    body: 'Term'
    
    def __str__(self):
        # No outer parens for lambda - it's clear from the λ
        return f"λ{self.param}.{self.body}"
    
    def __eq__(self, other):
        return isinstance(other, Lam) and self.param == other.param and self.body == other.body
    
    def __hash__(self):
        return hash(('Lam', self.param, self.body))


@dataclass  
class App:
    """An application: (func arg)"""
    func: 'Term'
    arg: 'Term'
    
    def __str__(self):
        # Parenthesize func if it's a lambda (to show it's being applied)
        # Parenthesize arg if it's an application (for clarity)
        func_str = f"({self.func})" if isinstance(self.func, Lam) else str(self.func)
        arg_str = f"({self.arg})" if isinstance(self.arg, App) else str(self.arg)
        return f"{func_str} {arg_str}"
    
    def __eq__(self, other):
        return isinstance(other, App) and self.func == other.func and self.arg == other.arg
    
    def __hash__(self):
        return hash(('App', self.func, self.arg))


Term = Var | Lam | App


# =============================================================================
# Free Variables & Substitution
# =============================================================================

def free_vars(term: Term) -> Set[str]:
    """Return the set of free variables in a term."""
    match term:
        case Var(name):
            return {name}
        case Lam(param, body):
            return free_vars(body) - {param}
        case App(func, arg):
            return free_vars(func) | free_vars(arg)


def fresh_var(avoid: Set[str], base: str = "x") -> str:
    """Generate a fresh variable name not in the avoid set."""
    if base not in avoid:
        return base
    i = 0
    while f"{base}{i}" in avoid:
        i += 1
    return f"{base}{i}"


def substitute(term: Term, var: str, replacement: Term) -> Term:
    """
    Substitute replacement for var in term: term[var := replacement]
    Uses capture-avoiding substitution.
    """
    match term:
        case Var(name):
            return replacement if name == var else term
        
        case Lam(param, body):
            if param == var:
                return term
            elif param not in free_vars(replacement):
                return Lam(param, substitute(body, var, replacement))
            else:
                new_param = fresh_var(free_vars(body) | free_vars(replacement) | {var}, param)
                new_body = substitute(body, param, Var(new_param))
                return Lam(new_param, substitute(new_body, var, replacement))
        
        case App(func, arg):
            return App(substitute(func, var, replacement), 
                      substitute(arg, var, replacement))


# =============================================================================
# Reduction Strategies
# =============================================================================

import random

class Strategy(Enum):
    """
    Reduction strategies for lambda calculus.
    
    NORMAL: Normal order - leftmost outermost redex first
        - Always finds normal form if it exists
        - Reduces under lambdas
    
    APPLICATIVE: Applicative order - leftmost innermost redex first
        - Reduces under lambdas
        - May not terminate even when normal form exists
    
    VALUE: Call-by-value - evaluate arguments before substitution
        - Strict/eager evaluation (like ML, Scheme, Python)
        - Does NOT reduce under lambdas (stops at WHNF)
        - May not terminate even when normal form exists
    
    FULL: Full beta - random redex selection
        - Reduces under lambdas
        - Picks a random redex at each step
        - Demonstrates Church-Rosser (all paths lead to same normal form)
    """
    NORMAL = "normal"
    APPLICATIVE = "applicative"
    VALUE = "value"
    FULL = "full"


def is_value(term: Term) -> bool:
    """Check if a term is a value (lambda or variable)."""
    match term:
        case Var(_) | Lam(_, _):
            return True
        case App(_, _):
            return False


def reduce_normal(term: Term) -> Term | None:
    """Normal Order: Leftmost outermost redex first. Reduces under lambdas."""
    match term:
        case App(Lam(param, body), arg):
            return substitute(body, param, arg)
        
        case App(func, arg):
            reduced_func = reduce_normal(func)
            if reduced_func is not None:
                return App(reduced_func, arg)
            reduced_arg = reduce_normal(arg)
            if reduced_arg is not None:
                return App(func, reduced_arg)
            return None
        
        case Lam(param, body):
            reduced_body = reduce_normal(body)
            if reduced_body is not None:
                return Lam(param, reduced_body)
            return None
        
        case Var(_):
            return None


def reduce_applicative(term: Term) -> Term | None:
    """Applicative Order: Leftmost innermost. Reduces under lambdas."""
    match term:
        case App(Lam(param, body), arg):
            # First reduce inside the lambda body
            reduced_body = reduce_applicative(body)
            if reduced_body is not None:
                return App(Lam(param, reduced_body), arg)
            # Then reduce the argument
            reduced_arg = reduce_applicative(arg)
            if reduced_arg is not None:
                return App(Lam(param, body), reduced_arg)
            # Finally, if both fully reduced, do beta reduction
            return substitute(body, param, arg)
        
        case App(func, arg):
            reduced_func = reduce_applicative(func)
            if reduced_func is not None:
                return App(reduced_func, arg)
            reduced_arg = reduce_applicative(arg)
            if reduced_arg is not None:
                return App(func, reduced_arg)
            return None
        
        case Lam(param, body):
            reduced_body = reduce_applicative(body)
            if reduced_body is not None:
                return Lam(param, reduced_body)
            return None
        
        case Var(_):
            return None


def reduce_value(term: Term) -> Term | None:
    """Call-by-Value: Evaluate args to values first. No reduction under lambdas."""
    match term:
        case App(Lam(param, body), arg):
            if is_value(arg):
                return substitute(body, param, arg)
            else:
                reduced_arg = reduce_value(arg)
                if reduced_arg is not None:
                    return App(Lam(param, body), reduced_arg)
                return None
        
        case App(func, arg):
            if not is_value(func):
                reduced_func = reduce_value(func)
                if reduced_func is not None:
                    return App(reduced_func, arg)
            if not is_value(arg):
                reduced_arg = reduce_value(arg)
                if reduced_arg is not None:
                    return App(func, reduced_arg)
            return None
        
        case Lam(_, _) | Var(_):
            return None


def find_all_redexes(term: Term, path: list = None) -> list:
    """Find all redexes in a term, returning list of paths."""
    if path is None:
        path = []
    
    redexes = []
    
    match term:
        case App(Lam(_, _), _):
            # This is a redex
            redexes.append(path)
            # Also look inside
            redexes.extend(find_all_redexes(term.func.body, path + ['func', 'body']))
            redexes.extend(find_all_redexes(term.arg, path + ['arg']))
        
        case App(func, arg):
            redexes.extend(find_all_redexes(func, path + ['func']))
            redexes.extend(find_all_redexes(arg, path + ['arg']))
        
        case Lam(_, body):
            redexes.extend(find_all_redexes(body, path + ['body']))
        
        case Var(_):
            pass
    
    return redexes


def reduce_at_path(term: Term, path: list) -> Term:
    """Reduce the redex at the given path."""
    if not path:
        # We're at the redex - it must be App(Lam(...), arg)
        match term:
            case App(Lam(param, body), arg):
                return substitute(body, param, arg)
            case _:
                raise ValueError("No redex at this path")
    
    direction, *rest = path
    match term:
        case App(func, arg):
            if direction == 'func':
                return App(reduce_at_path(func, rest), arg)
            else:  # 'arg'
                return App(func, reduce_at_path(arg, rest))
        case Lam(param, body):
            if direction == 'body':
                return Lam(param, reduce_at_path(body, rest))
            else:
                raise ValueError(f"Invalid path direction {direction} for Lam")
        case _:
            raise ValueError(f"Cannot follow path through {type(term)}")


def reduce_full(term: Term) -> Term | None:
    """Full Beta: Random redex selection. Reduces under lambdas."""
    redexes = find_all_redexes(term)
    if not redexes:
        return None
    # Pick a random redex
    path = random.choice(redexes)
    return reduce_at_path(term, path)


def get_reducer(strategy: Strategy):
    """Get the reduction function for a given strategy."""
    reducers = {
        Strategy.NORMAL: reduce_normal,
        Strategy.APPLICATIVE: reduce_applicative,
        Strategy.VALUE: reduce_value,
        Strategy.FULL: reduce_full,
    }
    return reducers[strategy]


def evaluate(term: Term, max_steps: int = 1000, trace: bool = False, 
             strategy: Strategy = Strategy.NORMAL) -> Term:
    """Fully evaluate a term using the specified reduction strategy."""
    reducer = get_reducer(strategy)
    current = term
    steps = 0
    
    if trace:
        print(f"  Strategy: {strategy.value}")
    
    while steps < max_steps:
        if trace:
            print(f"  {steps}: {current}")
        
        next_term = reducer(current)
        if next_term is None:
            if trace:
                form = "WHNF" if strategy == Strategy.VALUE else "normal form"
                print(f"  Reached {form} in {steps} steps")
            return current
        current = next_term
        steps += 1
    
    print(f"Warning: Reached max steps ({max_steps}), term may diverge")
    return current


def compare_strategies(term: Term, max_steps: int = 100) -> dict:
    """Compare how different strategies evaluate the same term."""
    results = {}
    for strategy in Strategy:
        try:
            steps = 0
            current = term
            reducer = get_reducer(strategy)
            while steps < max_steps:
                next_term = reducer(current)
                if next_term is None:
                    break
                current = next_term
                steps += 1
            results[strategy] = {"result": current, "steps": steps}
        except Exception as e:
            results[strategy] = {"error": str(e)}
    return results


# =============================================================================
# Redex Finding and Highlighting
# =============================================================================

def find_redex_normal(term: Term, path: list = None) -> list | None:
    """Find the path to the redex that normal order would reduce."""
    if path is None:
        path = []
    
    match term:
        case App(Lam(_, _), _):
            return path
        case App(func, arg):
            result = find_redex_normal(func, path + ['func'])
            if result is not None:
                return result
            return find_redex_normal(arg, path + ['arg'])
        case Lam(_, body):
            return find_redex_normal(body, path + ['body'])
        case Var(_):
            return None


def find_redex_value(term: Term, path: list = None) -> list | None:
    """Find redex for call-by-value strategy."""
    if path is None:
        path = []
    
    match term:
        case App(Lam(_, _), arg):
            if is_value(arg):
                return path
            else:
                return find_redex_value(arg, path + ['arg'])
        case App(func, arg):
            if not is_value(func):
                result = find_redex_value(func, path + ['func'])
                if result is not None:
                    return result
            if not is_value(arg):
                return find_redex_value(arg, path + ['arg'])
            return None
        case _:
            return None


def find_redex_applicative(term: Term, path: list = None) -> list | None:
    """Find redex for applicative order (leftmost innermost)."""
    if path is None:
        path = []
    
    match term:
        case App(Lam(param, body), arg):
            # First check inside lambda body
            result = find_redex_applicative(body, path + ['func', 'body'])
            if result is not None:
                return result
            # Then check argument
            result = find_redex_applicative(arg, path + ['arg'])
            if result is not None:
                return result
            # This redex is innermost
            return path
        case App(func, arg):
            result = find_redex_applicative(func, path + ['func'])
            if result is not None:
                return result
            return find_redex_applicative(arg, path + ['arg'])
        case Lam(_, body):
            return find_redex_applicative(body, path + ['body'])
        case Var(_):
            return None


def find_redex_full(term: Term) -> list | None:
    """Find a random redex for full beta reduction."""
    redexes = find_all_redexes(term)
    if not redexes:
        return None
    return random.choice(redexes)


def get_redex_finder(strategy: Strategy):
    """Get the redex finder for a given strategy."""
    finders = {
        Strategy.NORMAL: find_redex_normal,
        Strategy.APPLICATIVE: find_redex_applicative,
        Strategy.VALUE: find_redex_value,
        Strategy.FULL: find_redex_full,
    }
    return finders[strategy]


def get_subterm_at_path(term: Term, path: list) -> Term:
    """Get the subterm at the given path."""
    current = term
    for direction in path:
        match direction:
            case 'func': current = current.func
            case 'arg': current = current.arg
            case 'body': current = current.body
    return current


def format_with_redex(term: Term, path: list) -> str:
    """Format a term with the redex underlined (ANSI codes)."""
    UNDERLINE = '\033[4m'
    RESET = '\033[0m'
    
    def needs_parens_as_func(t: Term) -> bool:
        return isinstance(t, Lam)
    
    def needs_parens_as_arg(t: Term) -> bool:
        return isinstance(t, App)
    
    def fmt(t: Term, current_path: list) -> str:
        if current_path == path:
            return f"{UNDERLINE}{t}{RESET}"
        
        match t:
            case Var(name):
                return name
            case Lam(param, body):
                body_str = fmt(body, current_path + ['body'])
                return f"λ{param}.{body_str}"
            case App(func, arg):
                func_str = fmt(func, current_path + ['func'])
                arg_str = fmt(arg, current_path + ['arg'])
                if needs_parens_as_func(func) or (current_path + ['func'] == path[:len(current_path) + 1]):
                    func_str = f"({func_str})"
                if needs_parens_as_arg(arg) or (current_path + ['arg'] == path[:len(current_path) + 1] and isinstance(arg, App)):
                    arg_str = f"({arg_str})"
                return f"{func_str} {arg_str}"
    
    return fmt(term, [])


def interactive_trace(term: Term, strategy: Strategy = Strategy.NORMAL):
    """Interactive step-by-step debugger."""
    reducer = get_reducer(strategy)
    redex_finder = get_redex_finder(strategy)
    current = term
    step_num = 0
    
    print(f"  Interactive debugger (strategy: {strategy.value})")
    print(f"  Commands: (s)tep, (c)ontinue, (r)edex, (t)erm, (q)uit, (h)elp")
    print()
    
    redex_path = redex_finder(current)
    if redex_path is not None:
        print(f"  {step_num}: {format_with_redex(current, redex_path)}")
    else:
        print(f"  {step_num}: {current}")
        print(f"  Already in normal form!")
        return current
    
    while True:
        try:
            cmd = input("  debug> ").strip().lower()
            
            if not cmd or cmd in ('s', 'step'):
                next_term = reducer(current)
                if next_term is None:
                    print(f"  Term is in normal form.")
                    return current
                
                current = next_term
                step_num += 1
                
                redex_path = redex_finder(current)
                if redex_path is not None:
                    print(f"  {step_num}: {format_with_redex(current, redex_path)}")
                else:
                    print(f"  {step_num}: {current}")
                    print(f"  Reached normal form in {step_num} steps.")
                    return current
            
            elif cmd in ('c', 'continue'):
                terminated = False
                while True:
                    next_term = reducer(current)
                    if next_term is None:
                        terminated = True
                        break
                    current = next_term
                    step_num += 1
                    if step_num > 1000:
                        print(f"  Warning: exceeded 1000 steps, likely diverging")
                        break
                print(f"  {step_num}: {current}")
                if terminated:
                    print(f"  Reached normal form in {step_num} steps.")
                else:
                    print(f"  Stopped (term may diverge).")
                return current
            
            elif cmd in ('r', 'redex'):
                redex_path = redex_finder(current)
                if redex_path is not None:
                    redex = get_subterm_at_path(current, redex_path)
                    print(f"  Redex: {redex}")
                    if isinstance(redex, App) and isinstance(redex.func, Lam):
                        print(f"    (λ{redex.func.param}.{redex.func.body}) applied to {redex.arg}")
                else:
                    print(f"  No redex (normal form)")
            
            elif cmd in ('t', 'term'):
                print(f"  {current}")
            
            elif cmd in ('q', 'quit'):
                print(f"  Stopped at step {step_num}")
                return current
            
            elif cmd in ('h', 'help'):
                print("  s/step     - one reduction step")
                print("  c/continue - reduce to normal form")
                print("  r/redex    - show current redex")
                print("  t/term     - show term (no highlight)")
                print("  q/quit     - stop")
                print("  h/help     - this help")
            
            else:
                print(f"  Unknown: {cmd}. Type 'h' for help.")
        
        except (KeyboardInterrupt, EOFError):
            print(f"\n  Stopped at step {step_num}")
            return current


# =============================================================================
# Parser
# =============================================================================

class Parser:
    def __init__(self, text: str):
        self.text = text
        self.pos = 0
    
    def peek(self) -> str | None:
        self.skip_whitespace()
        return self.text[self.pos] if self.pos < len(self.text) else None
    
    def consume(self) -> str:
        self.skip_whitespace()
        char = self.text[self.pos]
        self.pos += 1
        return char
    
    def skip_whitespace(self):
        while self.pos < len(self.text) and self.text[self.pos] in ' \t\n':
            self.pos += 1
    
    def parse_var(self) -> str:
        self.skip_whitespace()
        match = re.match(r'[a-zA-Z][a-zA-Z0-9_]*', self.text[self.pos:])
        if match:
            var = match.group()
            self.pos += len(var)
            return var
        raise SyntaxError(f"Expected variable at position {self.pos}")
    
    def parse_atom(self) -> Term:
        char = self.peek()
        if char == '(':
            self.consume()
            term = self.parse_term()
            if self.peek() != ')':
                raise SyntaxError(f"Expected ')' at position {self.pos}")
            self.consume()
            return term
        elif char and char.isalpha():
            return Var(self.parse_var())
        else:
            raise SyntaxError(f"Unexpected '{char}' at position {self.pos}")
    
    def parse_term(self) -> Term:
        char = self.peek()
        if char in ('λ', '\\'):
            self.consume()
            param = self.parse_var()
            if self.peek() != '.':
                raise SyntaxError(f"Expected '.' at position {self.pos}")
            self.consume()
            body = self.parse_term()
            return Lam(param, body)
        
        atoms = []
        while self.peek() and self.peek() not in (')', 'λ', '\\'):
            atoms.append(self.parse_atom())
        
        if not atoms:
            raise SyntaxError(f"Expected term at position {self.pos}")
        
        result = atoms[0]
        for atom in atoms[1:]:
            result = App(result, atom)
        return result


def parse(text: str) -> Term:
    """Parse a lambda calculus expression."""
    parser = Parser(text)
    term = parser.parse_term()
    parser.skip_whitespace()
    if parser.pos < len(parser.text):
        raise SyntaxError(f"Unexpected input: '{parser.text[parser.pos:]}'")
    return term


# =============================================================================
# Church Encodings
# =============================================================================

def church_numeral(n: int) -> Term:
    """Create Church numeral for n."""
    body = Var("x")
    for _ in range(n):
        body = App(Var("f"), body)
    return Lam("f", Lam("x", body))


def church_to_int(term: Term) -> int:
    """Convert a Church numeral to int."""
    def count_apps(t, f_name="f"):
        match t:
            case App(Var(name), rest) if name == f_name:
                return 1 + count_apps(rest, f_name)
            case _:
                return 0
    
    if isinstance(term, Lam) and isinstance(term.body, Lam):
        return count_apps(term.body.body, term.param)
    return -1


BUILTINS = {
    "I": r"\x.x",
    "K": r"\x.\y.x",
    "S": r"\x.\y.\z.x z (y z)",
    "Y": r"\f.(\x.f (x x)) (\x.f (x x))",
    "TRUE": r"\t.\f.t",
    "FALSE": r"\t.\f.f",
    "AND": r"\p.\q.p q p",
    "OR": r"\p.\q.p p q",
    "NOT": r"\p.p FALSE TRUE",
    "IF": r"\p.\a.\b.p a b",
    "PAIR": r"\x.\y.\f.f x y",
    "FST": r"\p.p TRUE",
    "SND": r"\p.p FALSE",
    "SUCC": r"\n.\f.\x.f (n f x)",
    "PLUS": r"\m.\n.\f.\x.m f (n f x)",
    "MULT": r"\m.\n.\f.m (n f)",
    "PRED": r"\n.\f.\x.n (\g.\h.h (g f)) (\u.x) (\u.u)",
    "SUB": r"\m.\n.n PRED m",
    "ISZERO": r"\n.n (\x.FALSE) TRUE",
    "ZERO": r"\f.\x.x",
    "ONE": r"\f.\x.f x",
    "TWO": r"\f.\x.f (f x)",
    "THREE": r"\f.\x.f (f (f x))",
}


class UndefinedSymbolError(Exception):
    """Raised when an undefined symbol is encountered."""
    def __init__(self, symbols: set):
        self.symbols = symbols
        if len(symbols) == 1:
            super().__init__(f"Undefined symbol: {next(iter(symbols))}")
        else:
            super().__init__(f"Undefined symbols: {', '.join(sorted(symbols))}")


def check_undefined(term: Term, defined: set, bound: set = None) -> set:
    """
    Check for undefined symbols in a term.
    Returns set of undefined symbol names.
    
    Only flags uppercase identifiers (which look like builtins/definitions).
    Lowercase identifiers are treated as intentional free variables.
    
    Args:
        term: The term to check
        defined: Set of defined names (builtins + user definitions)
        bound: Set of bound variables (from enclosing lambdas)
    """
    if bound is None:
        bound = set()
    
    match term:
        case Var(name):
            # Only flag if it starts with uppercase (looks like a builtin)
            if name[0].isupper() and name not in defined and name not in bound:
                return {name}
            return set()
        case Lam(param, body):
            return check_undefined(body, defined, bound | {param})
        case App(func, arg):
            return check_undefined(func, defined, bound) | check_undefined(arg, defined, bound)


def expand_builtins(term: Term, builtins: dict = BUILTINS, check: bool = False) -> Term:
    """Expand builtin names in a term."""
    match term:
        case Var(name):
            if name in builtins:
                expanded = parse(builtins[name])
                return expand_builtins(expanded, builtins, check)
            elif check and name[0].isupper():
                raise UndefinedSymbolError({name})
            return term
        case Lam(param, body):
            new_builtins = {k: v for k, v in builtins.items() if k != param}
            return Lam(param, expand_builtins(body, new_builtins, check))
        case App(func, arg):
            return App(expand_builtins(func, builtins, check), expand_builtins(arg, builtins, check))


# =============================================================================
# REPL
# =============================================================================

def repl():
    """Interactive Read-Eval-Print Loop."""
    print("Lambda Calculus Interpreter")
    print("=" * 50)
    print("Syntax:  λx.body  or  \\x.body  |  (f x)  |  x, y, z")
    print("Define:  name = expr")
    print()
    print("Commands:")
    print("  :q                    - quit")
    print("  :defs                 - show definitions")
    print("  :del <name>           - delete definition")
    print("  :strategy <s>         - set strategy (normal/applicative/value/full)")
    print("  :trace <expr>         - interactive debugger")
    print("  :run <expr>           - show all reduction steps")
    print("  :compare <expr>       - compare strategies")
    print("  :church <n>           - create Church numeral")
    print("  :toInt <expr>         - Church numeral to int")
    print("  :load/:save <file>    - load/save definitions")
    print()
    print(f"Strategies: normal (default), applicative, value, full")
    print(f"Builtins: {', '.join(BUILTINS.keys())}")
    print()
    
    strategy = Strategy.NORMAL
    user_defs = {}
    
    def all_defs():
        d = dict(BUILTINS)
        d.update(user_defs)
        return d
    
    def check_and_expand(term):
        """Check for undefined symbols during expansion."""
        return expand_builtins(term, all_defs(), check=True)
    
    def parse_def(line):
        if '=' not in line:
            return None
        i = line.index('=')
        name, expr = line[:i].strip(), line[i+1:].strip()
        if not name or not name[0].isalpha() or not expr:
            return None
        if not all(c.isalnum() or c == '_' for c in name):
            return None
        return (name, expr)
    
    while True:
        try:
            line = input(f"λ[{strategy.value}]> ").strip()
            if not line or line.startswith('#'):
                continue
            
            if line in (':q', ':quit'):
                print("Goodbye!")
                break
            
            if line == ':defs':
                if user_defs:
                    for n, d in user_defs.items():
                        print(f"  {n} = {d}")
                else:
                    print("  No definitions.")
                continue
            
            if line.startswith(':del '):
                name = line[5:].strip()
                if name in user_defs:
                    del user_defs[name]
                    print(f"  Deleted: {name}")
                else:
                    print(f"  Not found: {name}")
                continue
            
            if line.startswith(':strategy '):
                s = line[10:].strip().lower()
                smap = {x.value: x for x in Strategy}
                if s in smap:
                    strategy = smap[s]
                    print(f"  Strategy: {strategy.value}")
                else:
                    print(f"  Unknown. Use: {', '.join(smap.keys())}")
                continue
            
            if line.startswith(':trace '):
                t = parse(line[7:].strip())
                t = check_and_expand(t)
                print(f"  Parsed: {t}\n")
                interactive_trace(t, strategy)
                continue
            
            if line.startswith(':run '):
                t = parse(line[5:].strip())
                t = check_and_expand(t)
                print(f"  Parsed: {t}")
                evaluate(t, trace=True, strategy=strategy)
                continue
            
            if line.startswith(':compare '):
                t = parse(line[9:].strip())
                t = check_and_expand(t)
                print(f"  Comparing: {line[9:].strip()}\n")
                for s, data in compare_strategies(t).items():
                    if "error" in data:
                        print(f"  {s.value:8} ERROR")
                    else:
                        print(f"  {s.value:8} ({data['steps']:3} steps): {data['result']}")
                continue
            
            if line.startswith(':church '):
                try:
                    print(f"  {church_numeral(int(line[8:].strip()))}")
                except:
                    print("  Error: expected integer")
                continue
            
            if line.startswith(':toInt '):
                t = parse(line[7:].strip())
                t = check_and_expand(t)
                r = evaluate(t, strategy=strategy)
                print(f"  {church_to_int(r)}")
                continue
            
            if line.startswith(':save '):
                fn = line[6:].strip()
                with open(fn, 'w') as f:
                    for n, d in user_defs.items():
                        f.write(f"{n} = {d}\n")
                print(f"  Saved {len(user_defs)} definition(s)")
                continue
            
            if line.startswith(':load '):
                fn = line[6:].strip()
                try:
                    cnt = 0
                    with open(fn) as f:
                        for ln in f:
                            ln = ln.strip()
                            if ln and not ln.startswith('#'):
                                d = parse_def(ln)
                                if d:
                                    parse(d[1])  # validate
                                    user_defs[d[0]] = d[1]
                                    cnt += 1
                    print(f"  Loaded {cnt} definition(s)")
                except Exception as e:
                    print(f"  Error: {e}")
                continue
            
            if line.startswith(':'):
                print(f"  Unknown command")
                continue
            
            # Definition?
            d = parse_def(line)
            if d:
                try:
                    p = parse(d[1])
                    user_defs[d[0]] = d[1]
                    print(f"  {d[0]} = {p}")
                except SyntaxError as e:
                    print(f"  Syntax error: {e}")
                continue
            
            # Evaluate
            t = parse(line)
            t = check_and_expand(t)
            r = evaluate(t, strategy=strategy)
            print(f"  {r}")
            
        except SyntaxError as e:
            print(f"  Syntax error: {e}")
        except UndefinedSymbolError as e:
            print(f"  {e}")
        except KeyboardInterrupt:
            print("\n  (Use :q to exit)")
        except EOFError:
            print("\nGoodbye!")
            break
        except Exception as e:
            print(f"  Error: {e}")


# =============================================================================
# Demo
# =============================================================================

def demo():
    """Run demonstrations."""
    print("Lambda Calculus Interpreter - Demo")
    print("=" * 50)
    
    examples = [
        ("Identity", r"(\x.x) y"),
        ("Constant", r"((\x.\y.x) a) b"),
        ("Church 2+3", r"PLUS TWO THREE"),
        ("Church 2*3", r"MULT TWO THREE"),
        ("SKK = I", r"S K K x"),
    ]
    
    for name, expr in examples:
        print(f"\n{name}: {expr}")
        t = expand_builtins(parse(expr))
        r = evaluate(t)
        print(f"  → {r}")
        if any(x in expr for x in ("PLUS", "MULT", "PRED", "SUCC")):
            print(f"    = {church_to_int(r)}")
    
    print("\n" + "=" * 50)
    print("K I Ω  (Ω diverges, but K discards it)")
    print("=" * 50)
    k, i = parse(r"\x.\y.x"), parse(r"\z.z")
    omega = parse(r"(\w.w w) (\w.w w)")
    term = App(App(k, i), omega)
    print(f"Term: {term}\n")
    for s in Strategy:
        print(f"  {s.value:8}:", end=" ")
        r = evaluate(term, max_steps=50, strategy=s)
        print(r)


if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1 and sys.argv[1] == "--demo":
        demo()
    else:
        repl()

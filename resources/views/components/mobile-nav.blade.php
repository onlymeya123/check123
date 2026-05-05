@props(['route', 'label'])

@php($active = request()->routeIs($route) || request()->routeIs(Str::before($route, '.').'.*'))

<a href="{{ route($route) }}" @class([
    'whitespace-nowrap rounded-full px-4 py-2 text-xs font-black transition',
    'bg-orange-500 text-white shadow-sm' => $active,
    'bg-slate-100 text-slate-600' => ! $active,
])>{{ $label }}</a>

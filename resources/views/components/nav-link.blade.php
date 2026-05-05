@props(['route', 'label'])

@php($active = request()->routeIs($route) || request()->routeIs(Str::beforeLast($route, '.').'.*'))
<a href="{{ Route::has($route) ? route($route) : '#' }}" @class([
    'block rounded-2xl px-4 py-3 transition',
    'bg-orange-500 text-white shadow-sm' => $active,
    'text-slate-600 hover:bg-slate-100 hover:text-slate-950' => ! $active,
])>
    {{ $label }}
</a>

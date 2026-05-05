@props([
    'title',
    'value',
    'subtitle' => null,
    'color' => 'blue',
])

@php
    $colors = [
        'emerald' => 'bg-emerald-50 text-emerald-700 ring-emerald-100',
        'blue' => 'bg-blue-50 text-blue-700 ring-blue-100',
        'amber' => 'bg-amber-50 text-amber-700 ring-amber-100',
        'red' => 'bg-red-50 text-red-700 ring-red-100',
    ];
@endphp

<div class="rounded-3xl bg-white p-5 shadow-sm ring-1 {{ $colors[$color] ?? $colors['blue'] }}">
    <p class="text-sm font-semibold opacity-80">{{ $title }}</p>
    <p class="mt-3 text-3xl font-black text-slate-950">{{ $value }}</p>
    @if ($subtitle)
        <p class="mt-2 text-xs font-semibold text-slate-500">{{ $subtitle }}</p>
    @endif
</div>

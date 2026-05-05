<?php

namespace App\Http\Controllers;

use App\Models\Unit;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\View\View;

class UnitController extends Controller
{
    public function index(): View
    {
        return view('units.index', [
            'units' => Unit::query()->withCount('products')->latest()->paginate(10),
        ]);
    }

    public function create(): View
    {
        return view('units.form', ['unit' => null]);
    }

    public function store(Request $request): RedirectResponse
    {
        Unit::query()->create($this->validated($request));

        return redirect()->route('units.index')->with('status', 'Satuan berhasil ditambahkan.');
    }

    public function edit(Unit $unit): View
    {
        return view('units.form', compact('unit'));
    }

    public function update(Request $request, Unit $unit): RedirectResponse
    {
        $unit->update($this->validated($request, $unit));

        return redirect()->route('units.index')->with('status', 'Satuan berhasil diperbarui.');
    }

    public function destroy(Unit $unit): RedirectResponse
    {
        $unit->delete();

        return back()->with('status', 'Satuan berhasil dihapus.');
    }

    private function validated(Request $request, ?Unit $unit = null): array
    {
        $id = $unit?->id ?? 'NULL';

        return $request->validate([
            'name' => ['required', 'string', 'max:100', "unique:units,name,{$id}"],
            'symbol' => ['required', 'string', 'max:20', "unique:units,symbol,{$id}"],
        ]);
    }
}

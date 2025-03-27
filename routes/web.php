<?php
use App\Http\Controllers\ContactController;
use Illuminate\Support\Facades\Route;


Route::get('/', function () {
    return view('welcome');
});
Route::get('/contacts', [ContactController::class, 'index']);
Route::get('/contacts-list', [ContactController::class, 'getContacts']);
Route::post('/contacts', [ContactController::class, 'store']);
Route::get('/contacts/{id}', [ContactController::class, 'show']);
Route::put('/contacts/{id}', [ContactController::class, 'update']); 
Route::delete('/contacts/{id}', [ContactController::class, 'destroy']);
Route::post('/contacts/merge', [ContactController::class, 'merge']);

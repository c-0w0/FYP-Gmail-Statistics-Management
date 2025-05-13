<?php

use Illuminate\Support\Facades\Route;

use App\Services\GoogleService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Session;
use App\Http\Controllers\GoogleController;

// Communication ====================================================================================================================

Route::redirect('/', '/login');
Route::view('/login', 'google.login');

Route::get('/auth/google', [GoogleController::class, 'redirectToGoogle']);
Route::get('/callback', [GoogleController::class, 'handleGoogleCallback']);

Route::post('/logout', function () {
    Session::forget('google_token'); // Clear the session token
    return redirect('/login'); // Redirect to login page
});

// Statistics ====================================================================================================================

// Route::get('/stats', [GoogleController::class, 'requestAll']);
Route::get('/stats', function (Request $request) {
    if ($request->session()->has('google_token')) { 
        return app(GoogleController::class)->requestAll($request);
    } else {
        return redirect('/login');
    }
});

Route::get('/api/charts/heatmap/sent/{days}', [GoogleController::class, 'getSentMessagesDetails']);
Route::get('/api/charts/heatmap/received/{days}', [GoogleController::class, 'getReceivedMessagesDetails']);

Route::get('/api/charts/area/sent/{days}', [GoogleController::class, 'getSentMessagesPerDay']);
Route::get('/api/charts/area/received/{days}', [GoogleController::class, 'getReceivedMessagesPerDay']);

Route::get('/api/charts/pie/recipients/{days}', [GoogleController::class, 'getRecipientsData']);
Route::get('/api/charts/pie/senders/{days}', [GoogleController::class, 'getSendersData']);
Route::get('/api/charts/pie/readStatus/{days}', [GoogleController::class, 'getReadStatusData']);

// Management ====================================================================================================================

// Route::get('/management', [GoogleController::class, 'listEmail']);
Route::get('/management', function (Request $request) {
    if ($request->session()->has('google_token')) { 
        return app(GoogleController::class)->listEmail($request);
    } else {
        return redirect('/login');
    }
});

Route::get('/api/unsubscribe', [GoogleController::class, 'unsubscribe']);
Route::post('/api/{messageId}/markAsSpam', [GoogleController::class, 'markAsSpam']);
Route::post('/api/{email}&{label}/blockEmail', [GoogleController::class, 'blockEmail']);

Route::get('/api/fetchEmailBySender/{account}&{timeframe}', [GoogleController::class, 'fetchEmailsBySender']);



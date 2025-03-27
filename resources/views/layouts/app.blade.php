<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>@yield('title', 'CRM System')</title>
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css">
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
<style>
    .custom-field {
    background: #f8f9fa;
    padding: 10px;
    border-radius: 5px;
    margin-bottom: 10px;
}
</style>
</head>

<body>

    <nav class="navbar navbar-dark bg-dark">
        <div class="container">
            <a class="navbar-brand" href="#">CRM System</a>
        </div>
    </nav>

    <div class="container mt-4">
        @yield('content')
    </div>
    <script src="js/crud.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
    {{-- <script src="{{ asset('js/contacts.js') }}"></script> --}}
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
</body>

</html>

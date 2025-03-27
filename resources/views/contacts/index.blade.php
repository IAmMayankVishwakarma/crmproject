@extends('layouts.app')

@section('content')
<div class="container">
    <h2>Contacts</h2>

    <!-- Add Contact Form -->
    <form id="contactForm" class="form m-3">
        @csrf
        <input type="text" name="name" class="form-control m-3" placeholder="Name" required>
        <input type="email" name="email" class="form-control m-3" placeholder="Email" required>
        <input type="text" name="phone" class="form-control m-3" placeholder="Phone" required>
        
        <div class="row m-3">
            <div class="col-4">
                <label for="profile_image">Profile Image</label>
                <input type="file" name="profile_image" id="profile_image" class="form-control">
            </div>
            <div class="col-4">
                <label for="additional_file">Additional File</label>
                <input type="file" name="additional_file" id="additional_file" class="form-control">
            </div>
            <div class="col-4">
                <label>Gender</label><br>
                <label><input class="form-check-input" type="radio" name="gender" value="Male"> Male</label>
                <label><input class="form-check-input" type="radio" name="gender" value="Female"> Female</label>
                <label><input class="form-check-input" type="radio" name="gender" value="Other"> Other</label>
            </div>
        </div>

        <!-- Custom Fields -->
        <div id="customFieldsContainer">
            <h5>Custom Fields</h5>
            <div id="customFields"></div>
            <button type="button" id="addCustomField" class="btn btn-secondary btn-sm">+ Add Custom Field</button>
        </div>

        <div class="container text-center m-3">
            <button type="submit" class="btn btn-primary m-3">Add Contact</button>
        </div>
    </form>

    <hr />
    <div class="row mb-3">
        <div class="col-md-6">
            <input type="text" id="search" class="form-control" placeholder="Search by name or email...">
        </div>
        <div class="col-md-4">
            <select id="gender-filter" class="form-control">
                <option value="">All Genders</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
            </select>
        </div>
    </div>

    <hr />

    <!-- Contacts Table -->
    <table class="table" id="contactsTable">
        <thead>
            <tr>
                <th>Select</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Gender</th>
                <th>Action</th>
            </tr>
        </thead>
        <tbody></tbody>
    </table>

    <button id="mergeContacts" class="btn btn-warning btn-sm" style="display: none;">Merge Selected</button>

    <!-- Merge Modal -->
    <div class="modal fade" id="mergeContactModal" tabindex="-1">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Merge Contacts</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <p>Select the <strong>master</strong> contact:</p>
                    <select id="masterContact" class="form-control"></select>
                    <input type="hidden" id="secondaryContact">
                    <div class="text-center">
                        <button id="confirmMerge" class="btn btn-success">Merge Contacts</button>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Edit Contact Modal -->
    {{-- <div class="modal fade" id="editContactModal" tabindex="-1">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Edit Contact</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <form id="editContactForm">
                        @csrf
                        <input type="hidden" id="contact_id">
                        <input type="text" id="edit_name" class="form-control m-3" placeholder="Name" required>
                        <input type="email" id="edit_email" class="form-control m-3" placeholder="Email" required>
                        <input type="text" id="edit_phone" class="form-control m-3" placeholder="Phone" required>
                        <select id="edit_gender" class="form-control m-3">
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                        </select>
                        
                        <div id="editCustomFieldsContainer">
                            <h5>Custom Fields</h5>
                            <div id="editCustomFields"></div>
                            <button type="button" id="addEditCustomField" class="btn btn-secondary btn-sm">+ Add Custom Field</button>
                        </div>
                        
                        <button type="submit" class="btn btn-success">Update Contact</button>
                    </form>
                </div>
            </div>
        </div>
    </div> --}}
    <!-- Edit Contact Modal -->
<!-- Edit Contact Modal (Put this in your index.blade.php) -->
<div class="modal fade" id="editContactModal" tabindex="-1">
    <div class="modal-dialog modal-lg">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title">Edit Contact</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
                <!-- Content will be loaded dynamically via JavaScript -->
            </div>
        </div>
    </div>
</div>
<!-- Merge Modal -->
<div class="modal fade" id="mergeContactModal" tabindex="-1">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title">Merge Contacts</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
                <!-- Content loaded dynamically -->
            </div>
        </div>
    </div>
</div>
</div>
@endsection

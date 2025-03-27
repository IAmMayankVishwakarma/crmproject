 $(document).ready(function () {
    // Initialize variables
    let selectedContacts = [];
    
    // Load contacts on page load
    loadContacts();

    /** 📌 Load Contacts with Search/Filter */
    function loadContacts(search = '', gender = '') {
        $.get('/contacts-list', { search, gender }, function (response) {
            let contactsHTML = "";
            response.contacts.forEach(function (contact) {
                contactsHTML += `
                    <tr data-id="${contact.id}">
                        <td><input type="checkbox" class="contactCheckbox" value="${contact.id}"></td>
                        <td>${contact.name}</td>
                        <td>${contact.email}</td>
                        <td>${contact.phone}</td>
                        <td>${contact.gender}</td>
                        <td>
                            <button class="btn btn-warning btn-sm editContact" data-id="${contact.id}">Edit</button>
                            <button class="btn btn-danger btn-sm deleteContact" data-id="${contact.id}">Delete</button>
                        </td>
                    </tr>
                `;
            });
            $("#contactsTable tbody").html(contactsHTML);
            toggleMergeButton();
        });
    }

    /** 📌 Search Functionality */
    $('#search').on('keyup', function() {
        loadContacts($(this).val(), $('#gender-filter').val());
    });

    /** 📌 Gender Filter */
    $('#gender-filter').change(function() {
        loadContacts($('#search').val(), $(this).val());
    });

    /** 📌 Add Contact (AJAX) - Improved with Error Handling */
    $('#contactForm').submit(function (e) {
        e.preventDefault();
        
        let formData = new FormData(this);
        
        // Custom fields ko array format mein prepare karo
        let customFields = [];
        $('.custom-field').each(function () {
            let fieldName = $(this).find('.custom-field-name').val();
            let fieldValue = $(this).find('.custom-field-value').val();
            
            if (fieldName && fieldValue) {  // Only add if both values exist
                customFields.push({
                    'field_name': fieldName,
                    'field_value': fieldValue
                });
            }
        });
        
        // FormData mein custom fields ko append karo
        customFields.forEach((field, index) => {
            formData.append(`custom_fields[${index}][field_name]`, field.field_name);
            formData.append(`custom_fields[${index}][field_value]`, field.field_value);
        });
    
        $.ajax({
            url: '/contacts',
            type: 'POST',
            data: formData,
            contentType: false,
            processData: false,
            success: function (response) {
                Swal.fire('Success!', response.message, 'success');
                $('#contactForm')[0].reset();
                $('#customFields').empty(); // Clear custom fields
                loadContacts();
            },
            error: function(xhr) {
                let errorMsg = xhr.responseJSON?.message || 'Something went wrong!';
                Swal.fire('Error!', errorMsg, 'error');
            }
        });
    });

    /** 📌 Edit Contact Modal - Improved with File Handling */
    $(document).on('click', '.editContact', function () {
        let contactId = $(this).data('id');
        
        $.get('/contacts/' + contactId, function (response) {
            let contact = response.contact;
            
            $('#editContactForm')[0].reset();
            $('#contact_id').val(contact.id);
            $('#edit_name').val(contact.name);
            $('#edit_email').val(contact.email);
            $('#edit_phone').val(contact.phone);
            $('#edit_gender').val(contact.gender);

            // Load Custom Fields
            $('#editCustomFields').empty();
            contact.custom_fields.forEach(function (field) {
                addEditCustomField(field.field_name, field.field_value);
            });

            $('#editContactModal').modal('show');
        });
    });

    /** 📌 Helper Function to Add Edit Custom Fields */
    function addEditCustomField(name = '', value = '') {
        $('#editCustomFields').append(`
            <div class="custom-field row m-2">
                <div class="col-5">
                    <input type="text" class="form-control edit-custom-field-name" value="${name}" placeholder="Field Name" required>
                </div>
                <div class="col-5">
                    <input type="text" class="form-control edit-custom-field-value" value="${value}" placeholder="Field Value" required>
                </div>
                <div class="col-2">
                    <button type="button" class="btn btn-danger btn-sm removeField">X</button>
                </div>
            </div>
        `);
    }

    /** 📌 Update Contact (AJAX) - Improved */
   /** 📌 Update Contact Form Submission - Fixed CSRF Token */
$(document).on('submit', '#editContactForm', function(e) {
    e.preventDefault();
    
    let contactId = $('#contact_id').val();
    let formData = new FormData();
    
    // Add CSRF token and method spoofing
    formData.append('_token', $('meta[name="csrf-token"]').attr('content'));
    formData.append('_method', 'PUT');
    
    // Add basic fields
    formData.append('name', $('#edit_name').val());
    formData.append('email', $('#edit_email').val());
    formData.append('phone', $('#edit_phone').val());
    formData.append('gender', $('#edit_gender').val());
    
    // Add files
    let profileImage = $('#editContactForm input[name="profile_image"]')[0].files[0];
    let additionalFile = $('#editContactForm input[name="additional_file"]')[0].files[0];
    
    if (profileImage) formData.append('profile_image', profileImage);
    if (additionalFile) formData.append('additional_file', additionalFile);
    
    // Add custom fields
    $('.edit-custom-field-name').each(function(index) {
        let fieldName = $(this).val();
        let fieldValue = $('.edit-custom-field-value').eq(index).val();
        
        if (fieldName && fieldValue) {
            formData.append(`custom_fields[${index}][field_name]`, fieldName);
            formData.append(`custom_fields[${index}][field_value]`, fieldValue);
        }
    });
    
    // Show loading on button
    let submitBtn = $('#editContactForm button[type="submit"]');
    submitBtn.prop('disabled', true).html('<i class="fas fa-spinner fa-spin"></i> Updating...');
    
    // AJAX request
    $.ajax({
        url: '/contacts/' + contactId,
        type: 'POST', // Important: Must be POST for FormData with PUT method
        data: formData,
        contentType: false,
        processData: false,
        headers: {
            'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
        },
        success: function(response) {
            Swal.fire('Success!', response.message, 'success');
            $('#editContactModal').modal('hide');
            loadContacts();
        },
        error: function(xhr) {
            let errorMsg = xhr.responseJSON?.message || 'Something went wrong!';
            Swal.fire('Error!', errorMsg, 'error');
        },
        complete: function() {
            submitBtn.prop('disabled', false).text('Update Contact');
        }
    });
});
    /** 📌 Delete Contact with Confirmation */
    $(document).on('click', '.deleteContact', function () {
        let contactId = $(this).data('id');
        
        Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
        }).then((result) => {
            if (result.isConfirmed) {
                $.ajax({
                    url: '/contacts/' + contactId,
                    type: 'POST',
                    data: {
                        _token: $('meta[name="csrf-token"]').attr('content'),
                        _method: 'DELETE'
                    },
                    success: function (response) {
                        Swal.fire('Deleted!', response.message, 'success');
                        loadContacts();
                    }
                });
            }
        });
    });

    /** 📌 Toggle Merge Button Visibility */
    function toggleMergeButton() {
        let checkedCount = $('.contactCheckbox:checked').length;
        $('#mergeContacts').toggle(checkedCount === 2);
    }

    /** 📌 Handle Contact Selection for Merge */
    $(document).on('change', '.contactCheckbox', function() {
        selectedContacts = $(".contactCheckbox:checked").map(function() {
            return $(this).val();
        }).get();
        toggleMergeButton();
    });

    /** 📌 Merge Contacts Functionality */
    $('#mergeContacts').click(function () {
        if (selectedContacts.length !== 2) {
            Swal.fire('Error!', 'Please select exactly two contacts to merge.', 'error');
            return;
        }

        $('#masterContact').empty();
        $('#secondaryContact').val(selectedContacts[1]);
        
        // Populate dropdown with both contacts
        $.each(selectedContacts, function(index, contactId) {
            $.get('/contacts/' + contactId, function(response) {
                $('#masterContact').append(`<option value="${response.contact.id}">${response.contact.name}</option>`);
            });
        });

        $('#mergeContactModal').modal('show');
    });

    /** 📌 Confirm Merge */
    $('#confirmMerge').click(function () {
        let masterId = $('#masterContact').val();
        let secondaryId = $('#secondaryContact').val();

        $.ajax({
            url: '/contacts/merge',
            type: 'POST',
            data: {
                _token: $('meta[name="csrf-token"]').attr('content'),
                master_id: masterId,
                secondary_id: secondaryId
            },
            success: function (response) {
                Swal.fire('Success!', response.message, 'success');
                $('#mergeContactModal').modal('hide');
                loadContacts();
            },
            error: function(xhr) {
                Swal.fire('Error!', xhr.responseJSON.message, 'error');
            }
        });
    });

    
    $('#addCustomField').click(function () {
        $('#customFields').append(`
            <div class="custom-field row m-2">
                <div class="col-5">
                    <input type="text" class="form-control custom-field-name" placeholder="Field Name" required>
                </div>
                <div class="col-5">
                    <input type="text" class="form-control custom-field-value" placeholder="Field Value" required>
                </div>
                <div class="col-2">
                    <button type="button" class="btn btn-danger btn-sm removeField">X</button>
                </div>
            </div>
        `);
    });
    /** 📌 Remove Custom Field */
    $(document).on('click', '.removeField', function () {
        $(this).closest('.custom-field, .edit-custom-field').remove();
    });
});

/** 📌 Open Edit Contact Modal - Fixed Version */
/** 📌 Edit Contact Button Handler */
$(document).on('click', '.editContact', function() {
    let contactId = $(this).data('id');
    
    // Show loading in modal
    $('#editContactModal').modal('show');
    $('#editContactModal .modal-body').html(`
        <div class="text-center p-5">
            <i class="fas fa-spinner fa-spin fa-3x"></i>
            <p>Loading contact details...</p>
        </div>
    `);
    
    // Fetch contact data
    $.get('/contacts/' + contactId, function(response) {
        let contact = response.contact;
        
        // Set modal content with form
        $('#editContactModal .modal-body').html(`
            <form id="editContactForm">
                <input type="hidden" id="contact_id" value="${contact.id}">
                
                <div class="row mb-3">
                    <div class="col-md-6">
                        <label>Name</label>
                        <input type="text" id="edit_name" value="${contact.name}" class="form-control" required>
                    </div>
                    <div class="col-md-6">
                        <label>Email</label>
                        <input type="email" id="edit_email" value="${contact.email}" class="form-control" required>
                    </div>
                </div>
                
                <div class="row mb-3">
                    <div class="col-md-6">
                        <label>Phone</label>
                        <input type="text" id="edit_phone" value="${contact.phone}" class="form-control" required>
                    </div>
                    <div class="col-md-6">
                        <label>Gender</label>
                        <select id="edit_gender" class="form-control" required>
                            <option value="Male" ${contact.gender === 'Male' ? 'selected' : ''}>Male</option>
                            <option value="Female" ${contact.gender === 'Female' ? 'selected' : ''}>Female</option>
                            <option value="Other" ${contact.gender === 'Other' ? 'selected' : ''}>Other</option>
                        </select>
                    </div>
                </div>
                
                <div class="row mb-3">
                    <div class="col-md-6">
                        <label>Profile Image</label>
                        <input type="file" name="profile_image" class="form-control">
                        <small class="text-muted">Current: ${contact.profile_image ? contact.profile_image.split('/').pop() : 'None'}</small>
                    </div>
                    <div class="col-md-6">
                        <label>Additional File</label>
                        <input type="file" name="additional_file" class="form-control">
                        <small class="text-muted">Current: ${contact.additional_file ? contact.additional_file.split('/').pop() : 'None'}</small>
                    </div>
                </div>
                
                <div id="editCustomFieldsContainer" class="mb-3">
                    <h5>Custom Fields</h5>
                    <div id="editCustomFields"></div>
                    <button type="button" id="addEditCustomField" class="btn btn-secondary btn-sm mt-2">+ Add Custom Field</button>
                </div>
                
                <button type="submit" class="btn btn-primary">Update Contact</button>
            </form>
        `);
        
        // Load Custom Fields
        if (contact.custom_fields && contact.custom_fields.length > 0) {
            contact.custom_fields.forEach(function(field) {
                $('#editCustomFields').append(`
                    <div class="custom-field row mb-2">
                        <div class="col-5">
                            <input type="text" class="form-control edit-custom-field-name" 
                                   value="${field.field_name}" placeholder="Field Name" required>
                        </div>
                        <div class="col-5">
                            <input type="text" class="form-control edit-custom-field-value" 
                                   value="${field.field_value}" placeholder="Field Value" required>
                        </div>
                        <div class="col-2">
                            <button type="button" class="btn btn-danger btn-sm removeField">X</button>
                        </div>
                    </div>
                `);
            });
        }
        
    }).fail(function() {
        Swal.fire('Error!', 'Could not load contact data', 'error');
        $('#editContactModal').modal('hide');
    });
});

/** 📌 Update Contact Form Submission */
$(document).on('submit', '#editContactForm', function(e) {
    e.preventDefault();
    
    let contactId = $('#contact_id').val();
    let formData = new FormData();
    
    // Add basic fields
    formData.append('_method', 'PUT');
    formData.append('name', $('#edit_name').val());
    formData.append('email', $('#edit_email').val());
    formData.append('phone', $('#edit_phone').val());
    formData.append('gender', $('#edit_gender').val());
    
    // Add files
    if ($('#editContactForm input[name="profile_image"]')[0].files[0]) {
        formData.append('profile_image', $('#editContactForm input[name="profile_image"]')[0].files[0]);
    }
    if ($('#editContactForm input[name="additional_file"]')[0].files[0]) {
        formData.append('additional_file', $('#editContactForm input[name="additional_file"]')[0].files[0]);
    }
    
    // Add custom fields
    $('.edit-custom-field-name').each(function(index) {
        let fieldName = $(this).val();
        let fieldValue = $('.edit-custom-field-value').eq(index).val();
        
        if (fieldName && fieldValue) {
            formData.append(`custom_fields[${index}][field_name]`, fieldName);
            formData.append(`custom_fields[${index}][field_value]`, fieldValue);
        }
    });
    
    // Show loading on button
    let submitBtn = $('#editContactForm button[type="submit"]');
    submitBtn.prop('disabled', true).html('<i class="fas fa-spinner fa-spin"></i> Updating...');
    
    // AJAX request
    $.ajax({
        url: '/contacts/' + contactId,
        type: 'POST',
        data: formData,
        contentType: false,
        processData: false,
        success: function(response) {
            Swal.fire('Success!', response.message, 'success');
            $('#editContactModal').modal('hide');
            loadContacts();
        },
        error: function(xhr) {
            let errorMsg = xhr.responseJSON?.message || 'Something went wrong!';
            Swal.fire('Error!', errorMsg, 'error');
        },
        complete: function() {
            submitBtn.prop('disabled', false).text('Update Contact');
        }
    });
});

/** 📌 Add Custom Field in Edit Form */
$(document).on('click', '#addEditCustomField', function() {
    $('#editCustomFields').append(`
        <div class="custom-field row mb-2">
            <div class="col-5">
                <input type="text" class="form-control edit-custom-field-name" placeholder="Field Name" required>
            </div>
            <div class="col-5">
                <input type="text" class="form-control edit-custom-field-value" placeholder="Field Value" required>
            </div>
            <div class="col-2">
                <button type="button" class="btn btn-danger btn-sm removeField">X</button>
            </div>
        </div>
    `);
});

/** 📌 Handle Merge Button Click - Fixed Version */
$('#mergeContacts').click(function() {
    let selectedContacts = $(".contactCheckbox:checked").map(function() {
        return $(this).val();
    }).get();

    if (selectedContacts.length !== 2) {
        Swal.fire('Error!', 'Please select exactly two contacts to merge.', 'error');
        return;
    }

    // Reset and prepare modal
    $('#masterContact').empty();
    $('#secondaryContact').val(selectedContacts[1]);
    
    // Show loading in modal
    $('#mergeContactModal').modal('show');
    $('#mergeContactModal .modal-body').html(`
        <div class="text-center p-5">
            <i class="fas fa-spinner fa-spin fa-3x"></i>
            <p>Loading contact details...</p>
        </div>
    `);

    // Load both contacts
    let promises = [
        $.get('/contacts/' + selectedContacts[0]),
        $.get('/contacts/' + selectedContacts[1])
    ];

    Promise.all(promises).then(function(responses) {
        let contact1 = responses[0].contact;
        let contact2 = responses[1].contact;
        
        $('#mergeContactModal .modal-body').html(`
            <p>Select the <strong>master</strong> contact:</p>
            <select id="masterContact" class="form-control mb-3">
                <option value="${contact1.id}">${contact1.name} (${contact1.email})</option>
                <option value="${contact2.id}">${contact2.name} (${contact2.email})</option>
            </select>
            <input type="hidden" id="secondaryContact" value="${selectedContacts[1]}">
            <div class="text-center">
                <button id="confirmMerge" class="btn btn-success">Merge Contacts</button>
            </div>
        `);
    }).catch(function() {
        Swal.fire('Error!', 'Could not load contact data', 'error');
        $('#mergeContactModal').modal('hide');
    });
});

/** 📌 Confirm Merge - Fixed Version */
$(document).on('click', '#confirmMerge', function() {
    let masterId = $('#masterContact').val();
    let secondaryId = $('#masterContact option').not(`[value="${masterId}"]`).val();
    
    // Show loading
    let mergeBtn = $(this);
    mergeBtn.prop('disabled', true).html('<i class="fas fa-spinner fa-spin"></i> Merging...');
    
    $.ajax({
        url: '/contacts/merge',
        type: 'POST',
        data: {
            _token: $('meta[name="csrf-token"]').attr('content'),
            master_id: masterId,
            secondary_id: secondaryId
        },
        success: function(response) {
            Swal.fire('Success!', response.message, 'success');
            $('#mergeContactModal').modal('hide');
            loadContacts();
        },
        error: function(xhr) {
            let errorMsg = xhr.responseJSON?.message || 'Merge failed!';
            Swal.fire('Error!', errorMsg, 'error');
        },
        complete: function() {
            mergeBtn.prop('disabled', false).text('Merge Contacts');
        }
    });
});

/** 📌 Toggle Merge Button Based on Selection */
$(document).on('change', '.contactCheckbox', function() {
    let checkedCount = $('.contactCheckbox:checked').length;
    $('#mergeContacts').toggle(checkedCount === 2);
});
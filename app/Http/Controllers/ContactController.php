<?php
namespace App\Http\Controllers;
use App\Models\Contact;
use App\Models\ContactCustomField;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;


class ContactController extends Controller
{
    public function index()
    {
        // $contacts = Contact::with('customFields')->get();
        return view('contacts.index');
    }
     public function getContacts(Request $request)
    {
        $query = Contact::query();

        if ($request->search) {
            $query->where('name', 'like', '%' . $request->search . '%')
                ->orWhere('email', 'like', '%' . $request->search . '%');
        }

        if ($request->gender) {
            $query->where('gender', $request->gender);
        }

            $contacts = $query->with('customFields')->get();
            return response()->json(['contacts' => $contacts]);
    }
    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required',
            'email' => 'required|email|unique:contacts',
            'phone' => 'required',
            'gender' => 'required',
            'profile_image' => 'nullable|image',
            'additional_file' => 'nullable|file',
            'custom_fields' => 'array'
        ]);
    
        if ($request->hasFile('profile_image')) {
            $data['profile_image'] = $request->file('profile_image')->store('uploads');
        }
    
        if ($request->hasFile('additional_file')) {
            $data['additional_file'] = $request->file('additional_file')->store('uploads');
        }
    
        $contact = Contact::create($data);
    
        if ($request->custom_fields) {
            foreach ($request->custom_fields as $field) {
                ContactCustomField::create([
                    'contact_id' => $contact->id,
                    'field_name' => $field['field_name'],
                    'field_value' => $field['field_value']
                ]);
            }
        }
    
        return response()->json(['message' => 'Contact Created Successfully!', 'contact' => $contact]);
    }
    
    public function show($id)
    {
        $contact = Contact::with('customFields')->find($id);
        if (!$contact) {
            return response()->json(['message' => 'Contact Not Found!'], 404);
        }
        return response()->json(['contact' => $contact]);
    }
    
    public function update(Request $request, $id)
    {
        $contact = Contact::find($id);
        if (!$contact) {
            return response()->json(['message' => 'Contact Not Found!'], 404);
        }
    
        $data = $request->validate([
            'name' => 'required',
            'email' => 'required|email|unique:contacts,email,' . $contact->id,
            'phone' => 'required',
            'gender' => 'required',
            'profile_image' => 'nullable|image',
            'additional_file' => 'nullable|file',
            'custom_fields' => 'array'
        ]);
    
        // File handling
        if ($request->hasFile('profile_image')) {
            if ($contact->profile_image) {
                Storage::delete($contact->profile_image);
            }
            $data['profile_image'] = $request->file('profile_image')->store('uploads');
        }
    
        if ($request->hasFile('additional_file')) {
            if ($contact->additional_file) {
                Storage::delete($contact->additional_file);
            }
            $data['additional_file'] = $request->file('additional_file')->store('uploads');
        }
    
        $contact->update($data);
    
        // Handle custom fields
        if ($request->custom_fields) {
            ContactCustomField::where('contact_id', $contact->id)->delete();
            foreach ($request->custom_fields as $field) {
                ContactCustomField::create([
                    'contact_id' => $contact->id,
                    'field_name' => $field['field_name'],
                    'field_value' => $field['field_value']
                ]);
            }
        }
    
        return response()->json([
            'message' => 'Contact Updated Successfully!', 
            'contact' => $contact->load('customFields')
        ]);
    } 



    public function destroy($id)
    {
        $contact = Contact::find($id);
        if (!$contact) return response()->json(['message' => 'Contact Not Found!'], 404);
    
        // Delete associated files
        if ($contact->profile_image) {
            Storage::delete($contact->profile_image);
        }
        if ($contact->additional_file) {
            Storage::delete($contact->additional_file);
        }
    
        $contact->delete();
        return response()->json(['message' => 'Contact Deleted Successfully!']);
    }
    


    public function merge(Request $request)
    {
        $request->validate([
            'master_id' => 'required|exists:contacts,id',
            'secondary_id' => 'required|exists:contacts,id|different:master_id'
        ]);
    
        $master = Contact::with('customFields')->find($request->master_id);
        $secondary = Contact::with('customFields')->find($request->secondary_id);
    
        // Merge emails (unique)
        $masterEmails = array_filter(explode(',', $master->email));
        $secondaryEmails = array_filter(explode(',', $secondary->email));
        $mergedEmails = array_unique(array_merge($masterEmails, $secondaryEmails));
        $master->email = implode(',', $mergedEmails);
    
        // Merge phones (unique)
        $masterPhones = array_filter(explode(',', $master->phone));
        $secondaryPhones = array_filter(explode(',', $secondary->phone));
        $mergedPhones = array_unique(array_merge($masterPhones, $secondaryPhones));
        $master->phone = implode(',', $mergedPhones);
    
        // Merge custom fields
        foreach ($secondary->customFields as $field) {
            ContactCustomField::updateOrCreate(
                ['contact_id' => $master->id, 'field_name' => $field->field_name],
                ['field_value' => $field->field_value]
            );
        }
    
        // Mark secondary as merged and delete
        $secondary->merged = true;
        $secondary->save();
        $secondary->delete(); // Soft delete if you have it
    
        // Save master contact
        $master->save();
    
        return response()->json([
            'message' => 'Contacts merged successfully!',
            'contact' => $master->load('customFields')
        ]);
    }

    
}

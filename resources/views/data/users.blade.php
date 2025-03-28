@section('content')
<div class="container-fluid">
<h3>
    Load the users data    
</h3>
<button id="load data" onclick="loadData()">click here to load data</button>    
<div id="displayData"></div>
</div>    
<script>
    function loadData()
    {
        let userData = new XMLHttpRequest();
         userData.onreadystatechange = function (){
           document.getElementById('displayData').innerHTML = this.responseText;
         }
    
    
    }
</script>
@endsection
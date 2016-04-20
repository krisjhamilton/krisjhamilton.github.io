$.ajax({
    url:  'https://df-destinydb.enterprise.dreamfactory.com/api/v2/destinydb/_table/destinyinventoryitemdefinition/-2144300014/',
    crossDomain: true,
    headers: {
        // "Access-Control-Allow-Origin" : "*",
        // "Access-Control-Allow-Methods" : "GET,POST",
        // "Access-Control-Allow-Headers": "Authorization",
        'Content-Type' : 'application/x-www-form-urlencoded; charset=UTF-8',
        'X-DreamFactory-Api-Key': '36fda24fe5588fa4285ac6c6c2fdfbdb6b6bc9834699774c9bf777f706d05a88', 
        'X-DreamFactory-Session-Token': 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjEsInVzZXJfaWQiOjEsImVtYWlsIjoia3Jpc2poYW1pbHRvbkBnbWFpbC5jb20iLCJmb3JldmVyIjpmYWxzZSwiaXNzIjoiaHR0cHM6XC9cL2RmLWRlc3RpbnlkYi5lbnRlcnByaXNlLmRyZWFtZmFjdG9yeS5jb21cL2FwaVwvdjJcL3N5c3RlbVwvYWRtaW5cL3Nlc3Npb24iLCJpYXQiOjE0NjExMzE5ODUsImV4cCI6MTQ2MTEzNTU4NSwibmJmIjoxNDYxMTMxOTg1LCJqdGkiOiI1YjFiN2RhODYwN2QxYzA2MzY4MmRiMmFhNGZhMGEyMyJ9.uMXUjklfKqbsx2F8Kxw83zAfVPcobFeJQoWE2SJGv3Y', 
        'Authorization': 'Basic a3Jpc2poYW1pbHRvbkBnbWFpbC5jb206Zmlyc3R0aW1lNg=='
    }
}).done(function(data){
    console.log(data);
})

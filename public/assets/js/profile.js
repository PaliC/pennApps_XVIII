$(document).ready(()=> {
  $('#edit-patient').click(() => {
    location.href = 'patient/edit';
  });
  $('#edit-provider').click(() => {
    location.href = 'provider/edit';
  });
})
$(document).ready(()=> {
  $('#edit-patient').click(() => {
    location.href = 'patient/edit';
  });
  $('#edit-provider').click(() => {
    location.href = 'provider/edit';
  });
  $('button.annoying').click((event) => {
    let button = event.target;
    let url =  '/patients/docusign/' + button.value;
    window.open(url, '_blank');
  });
  $('#view-patients').click(() => {
    location.href = '/patients/view';
  });
});
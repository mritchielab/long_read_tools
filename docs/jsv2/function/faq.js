$(document).ready(function () {
    
    $.getJSON("data/faqs.json", function (data) {
        faqHTML(data, function (faqhtml) {
            $("#faqAccordion").html("")
            $("#faqAccordion").append(faqhtml)
        })        
    });



});

function faqHTML(data, callback) {
   faqhtml=""
        $.each(data, function (key, faq) {
            faqhtml+=  '<div class="panel panel-default ">' +
        '<div class="panel-heading "data-toggle="collapse" data-parent="#faqAccordion" data-target="#question'+faq.id+'">' +
        '<h4 class="panel-title">' +
        '<a href="#" class="ing">'+faq.question+'</a>' +
        '</h4>' +

        ' </div>' +
        '<div id="question'+faq.id+'" class="panel-collapse collapse">' +
        '<div class="panel-body">' +
        ' <h5><span class="label label-primary">Answer</span></h5>' +

        '  <p>'+faq.answer+'</p>' +
        ' </div>' +
        ' </div>' +
        '</div>'
        })
        callback(faqhtml)
    
}
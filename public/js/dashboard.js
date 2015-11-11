(function($) {
    "use strict"; // Start of use strict

    //function for generation random numbers
    function randInt(min,max)
    {
        return Math.floor(Math.random()*(max-min+1)+min);
    }

    //choose a random image as the header background
    var imageName = 'url(../img/header' + parseInt(randInt(0,2)) + '.jpg)';
    $('header').css({'background-image':imageName});

    //populate the number of miles left to go
    $('.header-content-inner-number').text(parseInt(randInt(0,30)));

})(jQuery); // End of use strict

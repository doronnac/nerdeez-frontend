'''
Created on May 20, 2013
will create the views for the server app
@author: Doron Nachshon
@version: 1.0
@copyright: nerdeez.com
'''

#===============================================================================
# begin imports
#===============================================================================

from django.shortcuts import render_to_response
from django.template import RequestContext

#===============================================================================
# end imports
#===============================================================================

    
def spa(request):
    '''
    main spa application
    '''
    return render_to_response(
        'base.html',
        {},
        context_instance=RequestContext(request)
        )
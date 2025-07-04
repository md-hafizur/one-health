from .models import Role, User
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import UserSerializer

# Create your views here.
# create register user view
class RegisterUserView(APIView):
    def post(self, request, *args, **kwargs):
        identity = request.GET.get('identity')
        for_account = request.GET.get('for_account')
        phone = request.data.get('phone')
        email = request.data.get('email')
        data = request.data
        request.data['username'] = phone if phone else email or data.get('first_name') + '-' + data.get('last_name')
        
        
        if identity == 'DataCollector' :
            # get_dataCollector = User.objects.filter(role='dataCollector', pk = request.user.id).first()
            # if not get_dataCollector:
            #         return Response("You are not a DataCollector", status=status.HTTP_400_BAD_REQUEST)

            if for_account == 'public':
                request.data['addBy'] = get_dataCollector.id
                get_role = Role.objects.filter(name = 'public').first()
                request.data['role'] = get_role.id

            elif for_account == 'sub_account':
                parent_id = data.get('parent')
                get_parrent = User.objects.filter(pk = parent_id).first()
                if not get_parrent:
                    return Response("Invalid parent id", status=status.HTTP_400_BAD_REQUEST)
                request.data['parent'] = get_parrent.id
                request.data['username'] = 'sub_' + phone if phone else email
                request.data['addBy'] = get_dataCollector.id
                get_role = Role.objects.filter(name = 'public').first()
                request.data['role'] = get_role.id
            else:
                get_role = Role.objects.filter(name = 'dataCollector').first()
                request.data['role'] = get_role.id
        else:
           return Response("only data collector can register", status=status.HTTP_400_BAD_REQUEST)

        serializer = UserSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            # write message for varify otp 
            return Response({
                "send_otp" : True,
                "data" : serializer.data,
                "message" : "User needs to varify otp"
            })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
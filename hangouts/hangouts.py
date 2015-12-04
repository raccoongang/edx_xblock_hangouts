import pkg_resources

from django.template import Template, Context
from webob import Response
from student.models import CourseEnrollment
from xblock.core import XBlock
from xblock.fields import Scope, String
from xblock.fragment import Fragment
from xblockutils.studio_editable import StudioEditableXBlockMixin


# Make '_' a no-op so we can scrape strings
_ = lambda text: text


class HangoutsXBlock(StudioEditableXBlockMixin, XBlock):

    display_name = String(
        display_name=_("Display Name"),
        help=_("The name students see. This name appears in the course ribbon and as a header for the presentation."),
        default="Hangouts On Air",
        scope=Scope.settings,
    )

    youtube_url = String(
        default="",
        scope=Scope.settings,
    )

    editable_fields = ('display_name', )

    def resource_string(self, path):
        """Handy helper for getting resources from our kit."""
        data = pkg_resources.resource_string(__name__, path)
        return data.decode("utf8")

    def student_view(self, context=None):
        if context is None:
            context = {}

        is_course_staff = False
        if self.runtime.get_user_role() in ['instructor', 'staff']:
            is_course_staff = True

        context.update({
            'self': self,
            'is_course_staff': is_course_staff
        })

        template = self.render_template("static/html/hangouts.html", context)
        frag = Fragment(template)
        frag.add_css(self.resource_string("static/css/hangouts.css"))
        frag.add_javascript(self.resource_string("static/js/src/hangouts.js"))

        emails_enrolled = list(CourseEnrollment.objects.users_enrolled_in(course_id=self.course_id)\
            .values_list('email', flat=True))

        json_args = {
            'is_course_staff': is_course_staff,
            'title': self.display_name,
            'emails_enrolled': emails_enrolled,
            'start_date': self.start.strftime('%Y-%m-%dT%H:%M:%S.%f') if self.start else None,
            'youtube_url': self.youtube_url
        }
        frag.initialize_js('HangoutsXBlock', json_args=json_args)
        return frag

    def render_template(self, template_path, context):
        template_str = self.resource_string(template_path)
        template = Template(template_str)
        return template.render(Context(context))

    @XBlock.handler
    def save_youtube_url(self, request, suffix=''):
        self.youtube_url = request.params.get('youtube_url', '')
        return Response(json_body={'save': True})

    @XBlock.json_handler
    def get_youtube_url(self, data, suffix=''):
        return {"youtube_url": self.youtube_url}

    @staticmethod
    def workbench_scenarios():
        return [
            ("HangoutsXBlock",
             """<vertical_demo>
                <hangouts/>
                </vertical_demo>
             """),
        ]
